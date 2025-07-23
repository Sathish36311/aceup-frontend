import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenRefreshService } from '../../../core/auth/token-refresh.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  loginFailed: boolean = false;
  showPassword: boolean = false;

  @Output() closeLogin = new EventEmitter<void>();

  constructor() { }

  authService = inject(AuthService)
  tokenRefreshService = inject(TokenRefreshService)
  router = inject(Router)


  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.tokenRefreshService.startWatching();  
        this.closeLogin.emit(); 
      },
      error: (err) => {
        this.triggerShake();
      }
    })
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  triggerShake() {
    this.loginFailed = true;
    // remove class after animation ends (400ms)
    setTimeout(() => {
      this.loginFailed = false;
    }, 400);
  }

  closeLoginForm() {
    this.closeLogin.emit();
  }

}
