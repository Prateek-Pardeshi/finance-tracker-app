import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SpinnerComponent } from '@components/spinner/spinner';
import { SpinnerService } from '@components/spinner/spinner.service';
import { Notification } from "@components/notification/notification";
import { NotificationService } from "@components/notification/notification.service";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerComponent, Notification],
  templateUrl: './app.html'
})
export class App implements OnInit, AfterViewInit {

  @ViewChild(SpinnerComponent) private spinnerComponent!: SpinnerComponent;
  @ViewChild(Notification) private notifyComponent!: Notification;

  constructor() {}

  protected readonly title = signal('finance-tracker-app');
  private router = inject(Router);
  private spinnerService = inject(SpinnerService);
  private notifyService = inject(NotificationService);
  
  ngOnInit(): void {
    this.router.navigate(['/dashboard']);
  }

  ngAfterViewInit(): void {
    this.spinnerService.register(this.spinnerComponent);
    this.notifyService.register(this.notifyComponent);
  }
}
