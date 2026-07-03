import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SheetDetails, Transaction } from '@entities/types';
import { NotificationStyle, NotificationType } from '@entities/enum';
import { ConfigService } from '@services/config.service';
import { NotificationService } from '@components/notification/notification.service';
import { forkJoin, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class SheetService {
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