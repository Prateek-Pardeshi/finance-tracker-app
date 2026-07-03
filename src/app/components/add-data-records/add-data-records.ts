import { Component, OnInit, OnDestroy, ViewChild, inject, signal, WritableSignal } from '@angular/core';
import { Transaction, TransactionMetadata } from '@entities/types';
import { NotificationStyle, NotificationType, TransactionConstants } from '@entities/enum';
import { KeyValuePipe, JsonPipe, CommonModule } from '@angular/common';
import { FirebaseDataService } from '@services/firebaseData.service';
import { NotificationService } from '@components/notification/notification.service';
import { SpinnerService } from '@components/spinner/spinner.service';
import { TransactionFormComponent } from '@components/transaction-form/transaction-form';
import { SheetService } from '@services/sheet.service';
import { ConfigService } from '@services/config.service';
import { Router } from '@angular/router';
import { TransactionListComponent } from '@components/transaction-list/transaction-list';
import { IconInjector } from '@directives/icon-injector';

@Component({
  selector: 'app-add-data-records',
  imports: [KeyValuePipe, JsonPipe, CommonModule, TransactionFormComponent, TransactionListComponent, IconInjector],
  templateUrl: './add-data-records.html'
})
export class AddDataRecords {

  @ViewChild(TransactionFormComponent) private txFormComponent!: TransactionFormComponent;

  private configService = inject(ConfigService);
  private dataService = inject(FirebaseDataService);
  private sheetService = inject(SheetService);
  private router = inject(Router);
  private SpinnerService = inject(SpinnerService);
  private notificationService = inject(NotificationService);

  isConnected = false;
  sheetUrl = '';
  isCopyingDone = false;
  copySheetURL = '';
  name = new Date().getFullYear().toString();
  isVisible = signal(false);
  transactions: WritableSignal<Transaction[]> = signal([]);
  metadata: TransactionMetadata = new TransactionMetadata()
  isSaving = signal(false);  
  title: WritableSignal<string> = signal("Add Recurring Transaction")

  ngOnInit(): void {
    this.loadData();
    this.fetchMetadata();
    this.copySheetURL = this.configService.config.COPY_SHEET_URL;
  }

  loadData() {
    this.SpinnerService.startSpinner();
    this.dataService.getTransactions(TransactionConstants.COLLECTION_RECURRING_TRANSACTION)
      .subscribe((data: any) => {
         let tempTrans = data;
        tempTrans.forEach((item: any) => {
          if (item["date"] && new Date(item.date))
            item.date = this.sheetService.formatDate(item.date)
        })
        tempTrans = tempTrans.sort((a: any, b: any) =>
          this.sheetService.parseDate(b.date).getTime() - this.sheetService.parseDate(a.date).getTime()
        );
        this.transactions.set(tempTrans);
        this.SpinnerService.stopSpinner();
      });
  }

  fetchMetadata(): void {
    this.SpinnerService.startSpinner();
    if (this.configService.config) {
      this.metadata = this.configService.config;
      this.SpinnerService.stopSpinner();
    } else {
      this.dataService.getTransactions(TransactionConstants.COLLECTION_TRANSACTION_METADATA)
        .subscribe((data: any) => {
          this.metadata = data;
          this.SpinnerService.stopSpinner();
        });
    }
  }

  updateMetadata() {
    this.SpinnerService.startSpinner();
    const collectionRef = `${TransactionConstants.COLLECTION_TRANSACTION_METADATA}/${this.configService.config.DOCUMENT_ID}`;
    const obj = Object.entries(this.metadata).map((x)=>{ return x});
    let metadata: any = {};
    obj.forEach((item)=>{
      metadata[item[0].toString().toLowerCase()] = item[1];
    })
    this.dataService.updateData(collectionRef, metadata).then(() => {
      this.SpinnerService.stopSpinner();
      this.notificationService.open(NotificationStyle.TOAST, "Metadata Updated Successfully", NotificationType.SUCCESS);
      this.router.navigate(['/dashboard']);
    });
  }

  ngOnDestroy(): void {
  }

  addRecurringTransaction(transaction: Transaction): void {
    this.SpinnerService.startSpinner();
    this.dataService.addTransaction(transaction).then(() => {
      let tempTransactions = this.transactions();
      tempTransactions.unshift(transaction);
      this.transactions.update(() => tempTransactions);
      this.SpinnerService.stopSpinner();
      this.notificationService.open(NotificationStyle.TOAST, "Record Added Successfully", NotificationType.SUCCESS)
    })
      .finally(() => {
        this.SpinnerService.stopSpinner();
        this.isSaving.set(false);
        if (this.txFormComponent) {
          this.txFormComponent.resetForm();
        }
      });
  }

  deleteTransaction(transaction: Transaction) {
    this.SpinnerService.startSpinner(false);
    this.dataService.deleteData(transaction).then(()=>{
      this.SpinnerService.stopSpinner();
      this.notificationService.open(NotificationStyle.TOAST, "Record Deleted Successfully", NotificationType.SUCCESS)
    })
  }

  valueChange(key:string, value: any): void {
    (this.metadata as any)[key] = value;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }
}
