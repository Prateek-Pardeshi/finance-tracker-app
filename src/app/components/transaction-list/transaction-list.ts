import { Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { Transaction } from '@/app/entities/types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionType, PageDetails, FilterEntities } from '@/app/entities/enum';
import { TransactionItems } from '../transaction-items/transaction-items';
import { ConfigService } from '@services/config.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [FormsModule, CommonModule, TransactionItems],
  templateUrl: './transaction-list.html'
})
export class TransactionListComponent implements OnInit {
  @ViewChild('filterContainer', { static: true, read: ViewContainerRef })
  filterContainerRef!: ViewContainerRef;

  @ViewChild('filterTemplate', { static: true })
  filterTemplateRef!: TemplateRef<any>;

  constructor() { 
    effect(()=>{
      if(this.transactions().length > 0) {
        this.filteredRecords = this.transactions();
        this.applyPagination();
      }
    })
  }

  @Input() transactions: WritableSignal<Transaction[]> = signal([]);
  @Input() showFilters: boolean = true;

  filteredRecords: Transaction[] = [];
  category = signal<string>('');
  isSaving = false;

  private configServices = inject(ConfigService)

  get currentCategories(): string[] {
    return this.type === TransactionType.EXPENSE ? this.configServices.config.EXPENSE_CATEGORIES : this.configServices.config.INCOME_CATEGORIES;
  }

  pageDetails = PageDetails;

  description: string = '';
  type: TransactionType = TransactionType.EXPENSE;
  fromDate: string = "";
  toDate: string = "";

  appliedFilters = FilterEntities;

  TransactionType = TransactionType;
  expenseCategories = [];
  incomeCategories = [];

  ngOnInit() {}

  onPageSizeChange(): void {
    this.pageDetails.currentPage = 1;
    this.applyPagination();
  }

  applyPagination(): void {
    let storedRecords = this.transactions();
    if (storedRecords && storedRecords.length == 0) return;
    const start = (this.pageDetails.currentPage - 1) * Number(this.pageDetails.maxRecords);
    const end = Number(start) + Number(this.pageDetails.maxRecords);
    this.filteredRecords = storedRecords.slice(start, end);
    this.pageDetails.totalPages = Number(Math.ceil(storedRecords.length / this.pageDetails.maxRecords));
    this.pageDetails.recordsList = Array.from({ length: this.pageDetails.totalPages }, (_, i) => i + 1);
    this.pageDetails.recordsList.length > 0 && this.setRecordList();
  }

  setRecordList() {
    if (this.pageDetails.totalPages <= 5) {
      this.pageDetails.recordsList = Array.from({ length: this.pageDetails.totalPages }, (_, i) => i + 1);
    } else {
      const start = Number(this.pageDetails.currentPage);
      let end = Number(this.pageDetails.lastRecordPage) > Number(this.pageDetails.totalPages) ? Number(this.pageDetails.totalPages) : Number(this.pageDetails.lastRecordPage) + 4;
      end = end < 5 ? end : (start == 1 ? 5 : end);
      this.pageDetails.recordsList = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      this.pageDetails.flow == "next" && start != end && this.pageDetails.recordsList.push("...");
      this.pageDetails.flow == "prev" && start != end && this.pageDetails.recordsList.unshift("...");
    }
  }

  goToPage(page: any, flow = "next"): void {
    this.pageDetails.flow = flow;
    if (page === '...') {
      this.pageDetails.lastRecordPage += 5;
      this.setRecordList();
      page = this.pageDetails.recordsList[0];
    }
    this.pageDetails.currentPage = Number(page);
    if (page < 1 || page > this.pageDetails.totalPages) return;
    this.pageDetails.lastRecordPage = this.pageDetails.currentPage;
    this.applyPagination();
  }

  openAppliedFilters() { }

  openFilterPopup() { }

  closePopUp() { }

  resetFilters() { }

  applyFilters() { }

}

