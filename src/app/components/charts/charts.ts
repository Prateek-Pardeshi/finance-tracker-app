import { Transaction } from '@entities/types';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-charts',
  imports: [],
  templateUrl: './charts.html'
})
export class ChartsComponent {
  @Input() transactions: Transaction[] = [];
  @Input() chartType: string = "";
}
