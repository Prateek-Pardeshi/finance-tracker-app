import { Component, Input, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '@entities/types';
import { ChartsComponent } from '../charts/charts';
import { Duration, TransactionType } from '@entities/enum';

@Component({
  selector: 'app-summary',
  imports: [CommonModule, FormsModule, ChartsComponent],
  standalone: true,
  templateUrl: './summary.html'
})
export class SummaryComponent {
  @Input() transactions: Transaction[] = [];

  @ViewChild('viewContainer', { static: true, read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  @ViewChild('summaryTemplate', { static: true }) summaryTemplateTemplateRef!: TemplateRef<any>;
  @ViewChild('chartTemplate', { static: true }) chartTemplateTemplateRef!: TemplateRef<any>;

  showSummary: boolean = false;
  duration: string = Duration.YEARLY;
  totalIncome: number = 0;
  totalExpense: number = 0;
  balance: number = 0;
  finalTotalIncome: number = 0;
  finalTotalExpense: number = 0;
  finalBalance: number = 0;
  viewSummary: boolean = true;
  months: any = [];
  month: any = new Date().getMonth() + 1;
  
  showHideSummary(flag: boolean) {}

  setView(flag: boolean) {}

  showSummaryDurationWise() {}

  isChartVisible(chartType: string): boolean {
    const inc = this.transactions.filter(x => x.type == TransactionType.INCOME);
    const exp = this.transactions.filter(x => x.type == TransactionType.EXPENSE);
    return chartType.toLowerCase() == TransactionType.INCOME ? (inc && inc.length > 0) :
      (chartType.toLowerCase() == TransactionType.EXPENSE ? (exp && exp.length > 0) :
        chartType.toLowerCase() == "summary" ? inc && inc.length > 0 && exp && exp.length > 0 : false);
  }
}

