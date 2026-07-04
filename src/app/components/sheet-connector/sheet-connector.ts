import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconInjector } from '@directives/icon-injector';

@Component({
  selector: 'app-sheet-connector',
  imports: [CommonModule, FormsModule, IconInjector],
  templateUrl: './sheet-connector.html'
})
export class SheetConnector {

  constructor() { }

  @Input() isConnected: boolean = false;
  @Input() sheetUrl: string = '';
  @Input() isConnecting: boolean = false;
  @Output() connect = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();

  public isVisible = signal(false);
  public url: string = "";
  public icons = "";
  public copySheetURL = "";
  public isCopyingDone: boolean = false;
  public name: string = (new Date().getFullYear() + 1).toString();

  toggleVisibility() {
    this.isVisible.set(!this.isVisible());
  }

  async handleConnect() {
    if (!this.url || this.isConnecting) return;
    this.connect.emit(this.url);
  }

  handleReset() {
    this.url = '';
    location.href = location.origin + '/finance-tracker-app/';
  }
}
