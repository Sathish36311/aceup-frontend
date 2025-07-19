import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from '../auth/login/login.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LoginComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent {
  showLogin: boolean = false;

}
