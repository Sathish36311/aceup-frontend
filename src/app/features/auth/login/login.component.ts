import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  error: string = '';

  loginFailed: boolean = false;
  showPassword: boolean = false;

  @Output() close = new EventEmitter<void>();

  constructor() { }

  authService = inject(AuthService)
  router = inject(Router)



  ngOnInit(): void {

  }

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/auth/register']);
      },
      error: (err) => {
        this.triggerShake();
      }
    })
  }

  // ngOnInit(): void {
  //   // Prevent background scroll
  //   document.body.style.overflow = 'hidden';
  // }

  // ngOnDestroy(): void {
  //   // Restore scroll
  //   document.body.style.overflow = '';
  // }



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

  closeLogin() {
    this.close.emit();
  }

}
