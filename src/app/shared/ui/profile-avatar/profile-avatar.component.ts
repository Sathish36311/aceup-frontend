// app/shared/ui/profile-avatar/profile-avatar.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core'; // Added OnInit, OnDestroy
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service'; // Import UserInfo
import { Subscription } from 'rxjs'; // Import Subscription
import { UserInfo } from '../../../core/models/user-info.model';

@Component({
  selector: 'app-profile-avatar',
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class ProfileAvatarComponent implements OnInit, OnDestroy { // Implement OnInit, OnDestroy

  constructor(private router: Router) { }

  menuOpen = false;
  usernameInitials = ''; // Will hold the initials
  private authService = inject(AuthService);
  private userInfoSubscription!: Subscription; // To manage the subscription

  ngOnInit(): void {
    // Subscribe to the getUserInfo observable
    this.userInfoSubscription = this.authService.getUserInfo().subscribe(
      (userInfo: UserInfo | null) => {
        if (userInfo && userInfo.username) {
          this.usernameInitials = this.getInitials(userInfo.username);
        } else {
          this.usernameInitials = ''; // Clear initials if not logged in
        }
        console.log('ProfileAvatar - User Initials:', this.usernameInitials);
      },
      error => {
        console.error('Error getting user info in ProfileAvatar:', error);
        this.usernameInitials = ''; // Handle error gracefully
      }
    );
  }

  // Your existing getInitials method remains the same
  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    let initials = '';
    if (parts.length === 1) {
      initials = parts[0].substring(0, 2);
    } else if (parts.length >= 2) { // Ensure at least two parts for two initials
      initials = parts[0][0] + parts[parts.length - 1][0]; // First and last part's first letter
    }
    return initials.toUpperCase();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    // Using a slight delay to allow click event to propagate before menu closes
    setTimeout(() => (this.menuOpen = false), 150);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu(); // Close menu after logout
    this.router.navigate(['/login']); // Redirect to login after logout
  }

  goToProfile(): void {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.closeMenu();
    this.router.navigate(['/settings']);
  }

  // Implement ngOnDestroy to unsubscribe
  ngOnDestroy(): void {
    if (this.userInfoSubscription) {
      this.userInfoSubscription.unsubscribe();
    }
  }
}