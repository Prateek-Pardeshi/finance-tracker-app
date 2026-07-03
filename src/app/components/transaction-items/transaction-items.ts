import { Component, inject, Input } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { Transaction } from '@entities/types';
import { TransactionType } from '@entities/enum';
import { IconInjector } from '@directives/icon-injector';

@Component({
  selector: 'app-transaction-items',
  imports: [CurrencyPipe, CommonModule, IconInjector],
  templateUrl: './transaction-items.html'
})
export class TransactionItems {
   @Input() transaction!: Transaction;

  get isIncome(): boolean {
    return this.transaction.type === TransactionType.INCOME;
  }

  get amountColor(): string {
    return this.isIncome ? 'text-green-500' : 'text-red-500';
  }

  get iconBgColor(): string {
    return this.isIncome ? 'bg-green-100' : 'bg-red-100';
  }
}
