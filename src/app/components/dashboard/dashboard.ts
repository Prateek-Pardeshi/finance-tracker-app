import { Component, OnDestroy, OnInit, WritableSignal, inject, signal } from '@angular/core';
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

  transactions: WritableSignal<Transaction[]>  = signal([]);
  sheetUrl: string = '';
  isConnected: boolean = false;
  isConnecting: boolean = false;
  isSaving: boolean = false;
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

  ngOnDestroy(): void {
  }

}
