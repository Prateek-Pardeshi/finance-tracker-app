import { Component, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionType } from '@/app/entities/enum';
import { ConfigService } from '@services/config.service';
import { IconInjector } from '@directives/icon-injector';
import { Transaction } from '@/app/entities/types';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [FormsModule, IconInjector],
  templateUrl: './transaction-form.html'
})
export class TransactionFormComponent {
  @Input() title: WritableSignal<string> = signal('Add New Transaction');
  @Input() isSaving: WritableSignal<boolean> = signal(false);
  @Output() addTransaction = new EventEmitter<Omit<Transaction, 'id'>>();

  description: string = '';
  type: TransactionType = TransactionType.EXPENSE;
  category: string = "";
  amount: number | null = null;
  date: string = new Date().toISOString().split('T')[0];

  TransactionType = TransactionType;
  filteredCategories: string[] = [];
  showSuggestions: boolean = false;

  private configService = inject(ConfigService)

  constructor() {}

  ngOnInit() {
    this.category = this.currentCategories[0];
  }

  get currentCategories(): string[] {
    return this.type === TransactionType.EXPENSE ? this.configService.config.EXPENSE_CATEGORIES : this.configService.config.INCOME_CATEGORIES;
  }

  handleTypeChange(): void {
    this.category = this.currentCategories[0];
  }

  filterCategories() {
    const query = this.category.toLowerCase();
    this.filteredCategories = this.currentCategories.filter(cat =>
      cat.toLowerCase().includes(query)
    );
    this.showSuggestions = true
  }

  selectCategory(cat: string) {
    this.category = cat;
    this.description = cat;
    this.filteredCategories = [];
    this.showSuggestions = false;
  }

  onBlur() {
    this.showSuggestions = false;
  }

  clearText(event: any, flag: any) {
    if(flag)
      this.description = ""; 
    else {
      this.category = ""; 
      this.filterCategories();
    }  
    event.currentTarget.previousSibling.focus()    
  }

  async handleSubmit() {
    if (!this.description || this.amount === null || !this.date || !this.category || this.isSaving()) {
      return;
    }
    this.addTransaction.emit({
      date: this.date,
      amount: this.amount,
      description: this.description,
      category: this.category,
      type: this.type
    });
  }

  public resetForm(): void {
    this.description = '';
    this.amount = null;
    this.date = new Date().toISOString().split('T')[0];
    this.type = TransactionType.EXPENSE;
    this.category = this.configService.config.EXPENSE_CATEGORIES[0];
  }
}

