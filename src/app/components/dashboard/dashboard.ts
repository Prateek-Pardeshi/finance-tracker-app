import { Component } from '@angular/core';
import { TransactionFormComponent } from '../transaction-form/transaction-form';
import { SummaryComponent } from '../summary/summary';
import { TransactionListComponent } from '../transaction-list/transaction-list';
import { SheetConnector } from '../sheet-connector/sheet-connector';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TransactionFormComponent, SummaryComponent, TransactionListComponent, SheetConnector],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {

}
