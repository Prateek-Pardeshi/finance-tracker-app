import { Component, inject, Input } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { Transaction } from '@entities/types';
import { TransactionType, NotificationStyle, NotificationType } from '@entities/enum';
import { IconInjector } from '@directives/icon-injector';
import { FirebaseDataService } from '@services/firebaseData.service';
import { NotificationService } from '@components/notification/notification.service';

@Component({
  selector: 'app-transaction-items',
  imports: [CurrencyPipe, CommonModule, IconInjector],
  templateUrl: './transaction-items.html'
})
export class TransactionItems {
   @Input() transaction!: Transaction;
   @Input() allowDelete: boolean = false;

   private dataService = inject(FirebaseDataService);
   private notifyService = inject(NotificationService);

  get isIncome(): boolean {
    return this.transaction.type === TransactionType.INCOME;
  }

  get amountColor(): string {
    return this.isIncome ? 'text-green-500' : 'text-red-500';
  }

  get iconBgColor(): string {
    return this.isIncome ? 'bg-green-100' : 'bg-red-100';
  }

  deleteTransaction(transaction: any) {
    this.notifyService.open(NotificationStyle.POPUP, "Are you sure you want to Delete?", NotificationType.WARNING).then((response: boolean)=>{
      alert(response + " Pressed");
    });
    
    // this.dataService.deleteData(transaction).then(()=>{
    //   location.reload();
    // })
  }
}
