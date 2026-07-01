import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sheet-connector',
  imports: [CommonModule, FormsModule],
  templateUrl: './sheet-connector.html'
})
export class SheetConnector {

  constructor() { }

  @Input() isConnected: boolean = false;
  @Input() sheetUrl: string = '';
  @Input() isConnecting: boolean = false;
  @Output() connect = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();

  public isVisible: boolean = false;
  public url: string = "";
  public icons = "";
  public copySheetURL = "";
  public isCopyingDone: boolean = false;
  public name: string = (new Date().getFullYear() + 1).toString();

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  async handleConnect() {
    if (!this.url || this.isConnecting) return;
    this.connect.emit(this.url);
  }

  handleReset() {
    this.url = '';
    window.location.reload();
  }
}
