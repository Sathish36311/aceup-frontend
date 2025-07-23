import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-avatar',
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class ProfileAvatarComponent {
  menuOpen = false;
  usernameInitials = '';

  constructor(private router: Router) { }

  private authService = inject(AuthService)

  ngOnInit(): void {
    const username = this.authService.getUserInfo()['username']
    this.usernameInitials = this.getInitials(username);
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    let initials = '';
    if (parts.length === 1) {
      initials = parts[0].substring(0, 2);
    } else {
      initials = parts[0][0] + parts[1][0];
    }
    return initials.toUpperCase();
  }


  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    setTimeout(() => (this.menuOpen = false), 150);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
