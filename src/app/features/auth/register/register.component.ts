import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.enum';
import { RegisterRequest } from '../../../core/models/register-request.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = Role.ROLE_FAN;
  roles = Object.values(Role)
  showPassword = false;
  registerFailed = false;

  constructor(private authService: AuthService) { }

  @Output() closeRegister = new EventEmitter<boolean>();

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  closeRegisterForm(): void {
    this.closeRegister.emit()
  }

  onSubmit(): void {
    const registerRequest: RegisterRequest = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.authService.register(registerRequest).subscribe({
      next: (res) => {
        console.log('Registration successful:', res);
        // Optionally auto-login or redirect
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.registerFailed = true;
      }
    });
  }
}

