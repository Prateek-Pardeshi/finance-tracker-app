declare const gapi: any;
declare const google: any;

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SheetDetails, Transaction } from '@entities/types';
import { NotificationStyle, NotificationType, TransactionConstants, TransactionType } from '@entities/enum';
import { ConfigService } from '@services/config.service';
import { NotificationService } from '@components/notification/notification.service';
import { catchError, forkJoin, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../src/environment';

import { GoogleAuthProvider } from '@angular/fire/auth';
import { FirebaseDataService } from './firebaseData.service';
import { SpinnerService } from '@components/spinner/spinner.service';

@Injectable({
    providedIn: 'root'
})

export class SheetService {
    accessToken: string | null = null;
    summaryComponent: any;
    sheetDetails: SheetDetails = {
        sheetURL: '',
        sheetId: '',
        sheetName: '',
        transactionList: []
    }

    private configService = inject(ConfigService);
    private httpClient = inject(HttpClient);
    private notification = inject(NotificationService);
    private dataService = inject(FirebaseDataService);
    private spinnerService = inject(SpinnerService);
    private http = inject(HttpClient);
    private tokenClient: any;
    private clientId = environment.googleClientId;
    private ApiKey = environment.googleApiKey;

    recuringTransactions: Transaction[] = [];

    constructor() {
        this.dataService.getTransactions(TransactionConstants.COLLECTION_RECURRING_TRANSACTION)
            .subscribe((data: any[]) => {
                this.recuringTransactions = data;
            });
    }

    async signIn() {
        localStorage.removeItem(TransactionConstants.STORAGE_TOKEN);
        const provider = new GoogleAuthProvider();
        this.initGapi$().pipe(
            switchMap(() => this.initAuthClient$()),
            switchMap(() => this.requestAccessToken$())
        ).subscribe({
            next: (res) => { },
            error: (err) => {
                this.notification.open(NotificationStyle.POPUP, err?.message, NotificationType.ERROR);
            },
        });
    }

    signOut() {
        gapi && gapi.auth2 && gapi.auth2.getAuthInstance().signOut();
    }

    initGapi$(): Observable<void> {
        return new Observable<void>((observer) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.ApiKey,
                        discoveryDocs: [this.configService.config.DISCOVERY_DOC],
                    });
                    observer.next();
                    observer.complete();
                } catch (err: any) {
                    this.notification.open(NotificationStyle.POPUP, err.message, NotificationType.ERROR);
                }
            });
        });
    }

    initAuthClient$(): Observable<void> {
        return new Observable<void>((observer) => {
            try {
                google.accounts.id.initialize({
                    client_id: this.clientId,
                    callback: (response: any) => this.handleIdToken(response),
                    auto_select: true,
                    cancel_on_tap_outside: false
                });

                this.tokenClient = google.accounts.oauth2.initCodeClient({
                    client_id: this.clientId,
                    ux_mode: 'redirect', //'popup'
                    redirect_uri: window.location.origin + '/auth/callback',
                    scope: this.configService.config.TOKEN_SCOPE,
                    callback: (tokenResponse: any) => {
                        this.storeToken(tokenResponse);
                        observer.next();
                        observer.complete();
                    },
                    auto_select: true
                });
                observer.next();
                observer.complete();
            } catch (err) {
                observer.error(err);
            }
        });
    }

    handleIdToken(response: any) {
        this.notification.open(NotificationStyle.TOAST, 'Welcome: ' + response.credential, NotificationType.SUCCESS);
    }

    requestAccessToken$(): Observable<string> {
        return new Observable<string>((observer) => {
            this.tokenClient.callback = (tokenResponse: any) => {
                this.storeToken(tokenResponse);
                observer.next(this.accessToken!);
                observer.complete();
            };
            this.tokenClient.requestCode();
        });
    }

    storeToken(tokenResponse: any) {
        this.accessToken = tokenResponse.access_token;
        this.accessToken != null && this.accessToken && localStorage.setItem(TransactionConstants.STORAGE_TOKEN, this.accessToken);
    }

    handleSheetConnection() {
        this.sheetDetails.sheetURL = this.configService.config.DEFAULT_SHEET_URL;
        if (!this.sheetDetails.sheetURL.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit(\?.*)?(#.*)?$/)) {
            this.notification.open(NotificationStyle.POPUP, 'No sheet selected, please connect a google sheet first!', NotificationType.ERROR);
            return;
        }
        this.sheetDetails.sheetId = this.getSheetIdFromURL(this.sheetDetails.sheetURL);
        this.sheetDetails.sheetName = 'Transactions';
    }

    fetchTransactions(): Observable<any> {
        if (!this.sheetDetails.sheetId || !this.sheetDetails.sheetName) return of();
        const incomeQuery = encodeURIComponent(this.configService.config.INCOME_QUERY);
        const expenseQuery = encodeURIComponent(this.configService.config.EXPENSE_QUERY);
        const url = this.configService.config.FETCH_TRANSACTION_URL.replace("_SPREADSHEET_ID_", this.sheetDetails.sheetId).replace("_SHEET_NAME_", this.sheetDetails.sheetName);
        const incomeData$ = this.httpClient.get(url + incomeQuery, { responseType: 'text' });
        const expenseData$ = this.httpClient.get(url + expenseQuery, { responseType: 'text' });
        return forkJoin([incomeData$, expenseData$])
    }

    addTransaction(values: Transaction, allTransactions: Transaction[]): Observable<any> {
        if (!this.sheetDetails.sheetId || !this.sheetDetails.sheetName || !this.sheetDetails.sheetURL) {
            this.notification.open(NotificationStyle.TOAST, 'Checking Google Sheet Connection...', NotificationType.INFO);
            this.handleSheetConnection();
            return of(null);
        }

        if (this.configService.config.ISLOGINREQUIRED.toLowerCase() == 'true') {
            if (!this.accessToken) {
                this.spinnerService.stopSpinner();
                this.notification.open(NotificationStyle.TOAST, 'Requesting access token...', NotificationType.INFO);
                this.signIn()
            }
            return this.validateToken().pipe(
                switchMap((response) => {
                    let token = response;
                    return this.processTransactionsData(Boolean(this.configService.config.ISLOGINREQUIRED.toLowerCase()), values, allTransactions);
                }),
                catchError((error) => {
                    this.notification.open(NotificationStyle.POPUP, error.message, NotificationType.ERROR);
                    this.signIn();
                    return of(null);
                })
            )
        } else {
            return this.processTransactionsData(JSON.parse(this.configService.config.ISLOGINREQUIRED.toLowerCase()), values, allTransactions);
        }
    }

    validateToken(): Observable<any> {
        return this.http.get(this.configService.config.VALIDATE_TOKEN_URL.replace('_TOKEN_', this.accessToken || ''));
    }

    processTransactionsData(isLoginRequired: boolean, values: any, allTransactions: Transaction[]): Observable<any> {
        values.date = this.formatDate(values.date);
        const val = this.dataService.checkAndAddRecurringTransactions(allTransactions, this.recuringTransactions, values);
        const range = values.type === TransactionType.INCOME ? `${this.sheetDetails.sheetName}!G:J` : `${this.sheetDetails.sheetName}!B:E`;
        const valueRangeBody = {
            values: val.map((v) => [this.formatDate(v.date), v.amount, v.description, v.category]),
        };

        const payload = {
            spreadsheetId: this.sheetDetails.sheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            values: valueRangeBody.values
        };

        const url = !isLoginRequired ? this.configService.config.SHEET_ADD_URL :
            this.configService.config.ADD_TRANSACTION_URL.replace("_SPREADSHEET_ID_", this.sheetDetails.sheetId).replace("_RANGE_", range);

        const headers = !isLoginRequired ? new HttpHeaders({ 'Content-Type': 'text/plain' }) :
            { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' };
        return !isLoginRequired ? this.http.post(url, payload, { headers }) : this.http.post(url, valueRangeBody, { headers });
    }

    sortTransactions(transactions: Transaction[]): Transaction[] {
        return transactions.sort((a, b) =>
            this.parseDate(b.date).getTime() - this.parseDate(a.date).getTime()
        );
    }

    parseDate(dateStr: string): Date {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    formatDate(isoDate: string): string {
        if (isoDate.includes('/')) return isoDate;
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }

    private getSheetIdFromURL(url: string) {
        let sheetIdMatch = url.match(/spreadsheets\/d\/([^\/]+)\/edit/);
        return sheetIdMatch ? sheetIdMatch[1] : '';
    }
}