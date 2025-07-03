import { Routes } from '@angular/router';
import { DashboardComponent } from './shared/pages/dashboard.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: '**', redirectTo: '' }
];
