import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionType } from '@/app/entities/enum';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transaction-form.html'
})
export class TransactionFormComponent {
  @Input() title = signal<string>('Add New Transaction');
  @Input() isSaving = signal<boolean>(false);

  description: string = '';
  type: TransactionType = TransactionType.EXPENSE;
  category: string = "";
  amount: number | null = null;
  date: string = new Date().toISOString().split('T')[0];

  constructor() {}

  handleSubmit() {}

  clearText(event: any, flag: boolean) {}

  filterCategories() {}

  onBlur() {}

  selectCategory(category: any) {}

  handleTypeChange() {}
}

