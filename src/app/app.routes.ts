import { Routes } from '@angular/router';
import { DashboardComponent } from '@components/dashboard/dashboard';
import { AddDataRecords } from '@components/add-data-records/add-data-records';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'addRecord', component: AddDataRecords },
//   { path: 'ai-chat', component: ChatSliderComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//   { path: '**', component: AccessDeniedComponent }
];
