import { Injectable } from '@angular/core';
import { Notification } from './notification';
import { NotificationType } from '@/app/entities/enum';

@Injectable({ providedIn: 'root' })

export class NotificationService {
    constructor() {}
    private notificationComponent: Notification | null = null;

    register(notification: Notification) {
        this.notificationComponent = notification;
    }

    open(notificationStyle: any, message: string, type: string, duration: number = 3000): Promise<boolean> {
        if (this.notificationComponent) {
            this.notificationComponent.showNotification(notificationStyle, message, type, duration);
        } else {
            console.warn('NotificationComponent is not set.');
        }
        if(notificationStyle == NotificationType.WARNING) {
            return new Promise<boolean>(()=>{
                return this.notificationComponent?.confirmation();
            });
        }
        return new Promise<boolean>(()=>{ return true });
    }

    close(): void {
        if (this.notificationComponent) {
            this.notificationComponent.closeNotification();
        } else {
            console.warn('NotificationComponent is not set.');
        }
    }
}