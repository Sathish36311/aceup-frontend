import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoginComponent } from '../auth/login/login.component';
import { ProfileAvatarComponent } from '../../shared/ui/profile-avatar/profile-avatar.component';
import { AuthService } from '../../core/auth/auth.service';
import { RegisterComponent } from "../auth/register/register.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LoginComponent, ProfileAvatarComponent, RegisterComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent {
  showLogin: boolean = false;
  showRegister: boolean = false;
  isLoggedIn: boolean = false;

  authService = inject(AuthService)


  ngOnInit() {
    // this.authService.isLoggedIn$.subscribe(status => {
    //   this.isLoggedIn = status;
    // });
  }

}
