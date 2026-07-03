import { Injectable } from '@angular/core';
import { Notification } from './notification';

@Injectable({ providedIn: 'root' })

export class NotificationService {
    constructor() {}
    private notificationComponent: Notification | null = null;

    register(notification: Notification) {
        this.notificationComponent = notification;
    }

    open(notificationStyle: any, message: string, type: string, duration: number = 3000): void {
        if (this.notificationComponent) {
            this.notificationComponent.showNotification(notificationStyle, message, type, duration);
        } else {
            console.warn('NotificationComponent is not set.');
        }
    }

    close(): void {
        if (this.notificationComponent) {
            this.notificationComponent.closeNotification();
        } else {
            console.warn('NotificationComponent is not set.');
        }
    }
}