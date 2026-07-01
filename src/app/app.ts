import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App implements OnInit {

  constructor(private router: Router) {}
  protected readonly title = signal('finance-tracker-app');

  ngOnInit(): void {
    this.router.navigate(['/dashboard']);
  }

}
