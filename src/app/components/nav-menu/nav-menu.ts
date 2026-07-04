import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconInjector } from '@directives/icon-injector';

@Component({
  selector: 'app-nav-menu',
  imports: [IconInjector],
  templateUrl: './nav-menu.html'
})
export class NavMenu {
  
  private router = inject(Router);

  svgAction(action: string): void {
    const navMenu = document.getElementById("menu") as HTMLInputElement;
    if(navMenu) navMenu.checked = false;
    switch (action) {
      case 'top':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'bottom':
        window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
        break;
      case 'login':
        // this.sheetService.signIn();
        break;
      case 'home':
        this.router.navigate(['/dashboard']);
        break;
      case 'addRecord':
        this.router.navigate(['/addRecord']);
        break;
      case 'chat':
        this.router.navigate(['/ai-chat']);
        break;
    }
  }
}
