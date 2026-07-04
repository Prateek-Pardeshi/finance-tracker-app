import { Component, OnDestroy, OnInit, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { TransactionFormComponent } from '../transaction-form/transaction-form';
import { SummaryComponent } from '../summary/summary';
import { TransactionListComponent } from '../transaction-list/transaction-list';
import { SheetConnector } from '../sheet-connector/sheet-connector';
import { Transaction } from '@entities/types';
import { SheetService } from '@services/sheet.service'
import { Subject, takeUntil } from 'rxjs';
import { TransactionType, NotificationStyle, NotificationType } from '@/app/entities/enum';
import { SpinnerService } from '@components/spinner/spinner.service';
import { NotificationService } from '@components/notification/notification.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TransactionFormComponent, SummaryComponent, TransactionListComponent, SheetConnector],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild(TransactionFormComponent) private txFormComponent!: TransactionFormComponent;
  @ViewChild(SheetConnector) private sheetConnectorComponent!: SheetConnector;

  transactions: WritableSignal<Transaction[]>  = signal([]);
  isSaving: WritableSignal<boolean> = signal(false);
  sheetUrl: string = '';
  isConnected: boolean = false;
  isConnecting: boolean = false;  
  data: any;

  private sheetsService = inject(SheetService);
  private spinnerService = inject(SpinnerService);
  private notifyService = inject(NotificationService);

  ngOnInit(): void {    
    this.loadTransactionData();    
  }

  loadTransactionData(): void {
    this.spinnerService.startSpinner();
    this.sheetsService.handleSheetConnection();
    this.sheetsService.fetchTransactions()
      .subscribe(([incomeRes, expenseRes]) => {
        const incomeJson = JSON.parse(incomeRes.substring(47).slice(0, -2));
        const expenseJson = JSON.parse(expenseRes.substring(47).slice(0, -2));

        let idata = incomeJson.table.rows.map((r: any, index: number) => ({
          id: index + 1,
          date: r.c[0]?.f,
          amount: r.c[1]?.v,
          description: r.c[2]?.v,
          category: r.c[3]?.v,
          type: TransactionType.INCOME
        }));
        let edata = expenseJson.table.rows.map((r: any, index: number) => ({
          id: index + 1,
          date: r.c[0]?.f,
          amount: r.c[1]?.v,
          description: r.c[2]?.v,
          category: r.c[3]?.v,
          type: TransactionType.EXPENSE
        }));

        let transactions = [...idata, ...edata];
        if (transactions && transactions.length > 0)
          transactions = this.sheetsService.sortTransactions(transactions);
        if (this.sheetsService.sheetDetails)
          this.sheetsService.sheetDetails.transactionList = transactions;
        this.transactions.set(transactions);
        this.spinnerService.stopSpinner();
      });
  }

  handleAddTransaction(transaction: Transaction): void {
    this.isSaving.set(true);
    this.notifyService.open(NotificationStyle.TOAST, 'Saving transaction...', NotificationType.INFO, 1000);
    this.spinnerService.startSpinner(false);
    new Promise<void>((resolve) => {
      this.sheetsService.addTransaction(transaction, this.transactions())
        .subscribe({
          next: (resonse: any) => {
            if (resonse != null) {
              let tempTrans = this.transactions();
              this.transactions.update(() => this.sheetsService.sortTransactions(tempTrans));
              this.spinnerService.stopSpinner();
              this.notifyService.open(NotificationStyle.TOAST, 'Transaction Added!', NotificationType.SUCCESS, 2000);
              location.href = location.origin + '/finance-tracker-app/';
            }
          },
          error: (err: any) => {
            this.notifyService.open(NotificationStyle.POPUP, err.message ? err.message : err, NotificationType.ERROR);
          }
        });
      resolve();
    })
      .finally(() => {        
        this.isSaving.set(false);
        if (this.txFormComponent) {
          this.txFormComponent.resetForm();
        }
      });
  }

  ngOnDestroy(): void {
  }

}
