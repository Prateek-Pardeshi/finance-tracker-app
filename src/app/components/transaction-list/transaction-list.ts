import { ChangeDetectorRef, Component, Inject, Injector, Input, TemplateRef, ViewChild, ViewContainerRef, signal } from '@angular/core';
import { Transaction } from '@/app/entities/types'
import { FormsModule } from '@angular/forms'
import { TransactionType } from '@/app/entities/enum';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transaction-list.html'
})
export class TransactionListComponent {
  @ViewChild('filterContainer', { static: true, read: ViewContainerRef })
  filterContainerRef!: ViewContainerRef;

  @ViewChild('filterTemplate', { static: true })
  filterTemplateRef!: TemplateRef<any>;

  constructor(@Inject(Injector) private injector: Injector, private cdr: ChangeDetectorRef) { }

  @Input() transactions: Transaction[] = [];
  @Input() showFilters: boolean = true;

  filteredRecords: Transaction[] = [];
  storedRecords: Transaction[] = [];
  category = signal<string>('');
  isSaving = false;

  pageDetails = {
    currentPage: 1,
    totalPages: 0,
    pageSize: [5, 10, 15, 20],
    maxRecords: 5,
    recordsList: [],
    lastRecordPage: 5,
    flow: 'next'
  };

  description: string = '';
  type: TransactionType = TransactionType.EXPENSE;
  fromDate: string = "";
  toDate: string = "";

  appliedFilters: any = {
    showAppliedFilters: false,
    description: '',
    type: '',
    category: '',
    fromDate: '',
    toDate: ''
  };

  TransactionType = TransactionType;
  expenseCategories = [];
  incomeCategories = [];

  openAppliedFilters() {}

  openFilterPopup() {}

  closePopUp() {}

  resetFilters() {}

  applyFilters() {}

}

