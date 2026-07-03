import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';
import { icons } from '@entities/iocns';

@Directive({
  selector: '[appIconInjector]'
})
export class IconInjector implements AfterViewInit {

  iconName = input('')
  private element = inject(ElementRef);

  ngAfterViewInit(): void {
    switch (this.iconName()) {
      case 'arrow-down-icon':
        this.element.nativeElement.innerHTML = icons.ArrowDownIcon;
        break;
      case 'arrow-up-icon':
        this.element.nativeElement.innerHTML = icons.ArrowUpIcon;
        break;
      case 'eye-icon':
        this.element.nativeElement.innerHTML = icons.EyeIcon;
        break;
      case 'eye-slash-icon':
        this.element.nativeElement.innerHTML = icons.EyeSlashIcon;
        break;
      case 'spinner-icon':
        this.element.nativeElement.innerHTML = icons.SpinnerIcon;
        break;
      case 'plus-icon':
        this.element.nativeElement.innerHTML = icons.PlusIcon;
        break;
      case 'chart-icon':
        this.element.nativeElement.innerHTML = icons.ChartIcon;
        break;
      case 'summary-icon':
        this.element.nativeElement.innerHTML = icons.SummaryIcon;
        break;
      case 'top-icon':
        this.element.nativeElement.innerHTML = icons.TopIcon;
        break;
      case 'home-icon':
        this.element.nativeElement.innerHTML = icons.HomeIcon;
        break;
      case 'add-record-icon':
        this.element.nativeElement.innerHTML = icons.AddRecordIcon;
        break;
      case 'login-icon':
        this.element.nativeElement.innerHTML = icons.LoginIcon;
        break;
      case 'chat-icon':
        this.element.nativeElement.innerHTML = icons.ChatIcon;
        break;
        case 'notify-success-icon':
        this.element.nativeElement.innerHTML = icons.NotifySuccessIcon;
        break;
      case 'notify-error1-icon':
        this.element.nativeElement.innerHTML = icons.NotifyError1Icon;
        break;
      case 'notify-error-icon':
        this.element.nativeElement.innerHTML = icons.NotifyErrorIcon;
        break;
      case 'notify-info-icon':
        this.element.nativeElement.innerHTML = icons.NotifyInfoIcon;
        break;
    }
  }
}
