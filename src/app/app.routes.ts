import { Routes } from '@angular/router';
import { DashboardComponent } from '@components/dashboard/dashboard';
import { AddDataRecords } from '@components/add-data-records/add-data-records';
import { ChatSlider } from './components/chat-slider/chat-slider';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'addRecord', component: AddDataRecords },
    { path: 'ai-chat', component: ChatSlider },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//   { path: '**', component: AccessDeniedComponent }
];
