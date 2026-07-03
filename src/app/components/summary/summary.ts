import { Component, effect, inject, Input, OnInit, signal, TemplateRef, ViewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '@entities/types';
import { TransactionType, Duration } from '@entities/enum';
import { SheetService } from '@services/sheet.service';
import { ConfigService } from '@services/config.service';
import { ChartsComponent }  from '@components/charts/charts';
import { IconInjector } from '@directives/icon-injector';

@Component({
  selector: 'app-summary',
  imports: [CommonModule, FormsModule, ChartsComponent, IconInjector],
  templateUrl: './summary.html',
})

export class SummaryComponent implements OnInit {
  @Input() transactions: WritableSignal<Transaction[]> = signal([]);

  @ViewChild('viewContainer', { static: true, read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  @ViewChild('summaryTemplate', { static: true }) summaryTemplateTemplateRef!: TemplateRef<any>;
  @ViewChild('chartTemplate', { static: true }) chartTemplateTemplateRef!: TemplateRef<any>;

  constructor() { 
    effect(()=>{
      this.transactions() && this.transactions().length > 0 && this.calculateSummary(this.transactions());
    })
  }

  showSummary: boolean = false;
  duration: string = Duration.YEARLY;
  totalIncome: number = 0;
  totalExpense: number = 0;
  balance: number = 0;
  finalTotalIncome: number = 0;
  finalTotalExpense: number = 0;
  finalBalance: number = 0;
  viewSummary: boolean = true;
  months: any[] = [];
  month: any = new Date().getMonth() + 1;

  private sheetService = inject(SheetService);
  private configService = inject(ConfigService);

  ngOnInit(): void {
    if (this.sheetService) this.sheetService.summaryComponent = this;
    this.setView(this.viewSummary);
  }

  calculateSummary(transactions: Transaction[], skipSubscription: boolean = false): void {
    let tempTransactions = transactions.map(t => ({ ...t }));
    if (this.duration === Duration.DAILY || this.duration === Duration.MONTHLY) {
      const currentDate = new Date().getDate();
      const currentMonth = this.month.id;
      tempTransactions = transactions.filter(t => {
        const [day, month, year] = (t.date || '').split('/').map(Number);
        const txDate = new Date(year, month - 1, day);
        return this.duration === Duration.DAILY ?
          txDate.getDate() === currentDate :
          txDate.getMonth() + 1 === currentMonth;
      });
    }

    // !skipSubscription && this.sheetService.transactionsSubject.next(tempTransactions);

    this.totalIncome = tempTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    this.totalExpense = tempTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    this.balance = this.totalIncome - this.totalExpense;

    this.showSummary && this.showHideSummary(this.showSummary);
    this.setView(this.viewSummary, tempTransactions);
  }

  showHideSummary(show: boolean): void {
    this.showSummary = show;
    this.animateCount(this.showSummary ? this.totalIncome : 0, 'income');
    this.animateCount(this.showSummary ? this.totalExpense : 0, 'expense');
    this.animateCount(this.showSummary ? this.balance : 0, 'balance');
  }

  animateCount(target: number, flag: string) {
    let start = 0;
    const startTime = performance.now();
    [this.finalTotalIncome, this.finalTotalExpense, this.finalBalance] = [0, 0, 0];

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / 1200, 1) < 0 ? Math.min((time - startTime) / 1200, 1) * -1 : Math.min((time - startTime) / 1200, 1);
      switch (flag) {
        case 'income':
          start = !this.showSummary ? this.totalIncome : 0;
          this.finalTotalIncome = this.calulateProogress(progress, target, start);
          break;
        case 'expense':
          start = !this.showSummary ? this.totalExpense : 0;
          this.finalTotalExpense = this.calulateProogress(progress, target, start);
          break;
        case 'balance':
          start = !this.showSummary ? this.balance : 0;
          this.finalBalance = this.calulateProogress(progress, target, start);
          break;
      }
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  calulateProogress(progress: number, target: number, start: number): number {
    return !this.showSummary ? Math.floor(start * (1 - progress)) : Math.floor(progress * (target - start) + start);
  }

  showSummaryDurationWise(): void {
    if (this.duration === "Monthly" && (!this.months || this.months.length == 0)) {
      this.months = this.configService.config.MONTH;
      this.month = this.months ? this.months[new Date().getMonth()] : this.month;
    }
    this.calculateSummary(this.transactions());
  }

  setView(showChart: boolean, transactions: Transaction[] = []): void {
    this.viewSummary = showChart;
    this.viewContainerRef && this.viewContainerRef.clear()
    transactions = transactions && transactions.length > 0 ? transactions : this.transactions();
    this.viewSummary ? this.viewContainerRef.createEmbeddedView(this.summaryTemplateTemplateRef) :
      this.viewContainerRef.createEmbeddedView(this.chartTemplateTemplateRef, { transactions: transactions });
  }

  isChartVisible(chartType: any): boolean {
    let tempTransactions = this.transactions();
    const inc = tempTransactions.filter(x => x.type == TransactionType.INCOME);
    const exp = tempTransactions.filter(x => x.type == TransactionType.EXPENSE);
    return chartType.toLowerCase() == TransactionType.INCOME ? (inc && inc.length > 0) :
      (chartType.toLowerCase() == TransactionType.EXPENSE ? (exp && exp.length > 0) :
        chartType.toLowerCase() == "summary" ? inc && inc.length > 0 && exp && exp.length > 0 : false);
  }
}