// import { inject, Injectable, NgZone } from '@angular/core';
// import { AuthService } from './auth.service';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';
// import { tap } from 'rxjs';
// import { Router } from '@angular/router';

// @Injectable({ providedIn: 'root' })
// export class TokenRefreshService {
//   private readonly baseUrl = environment.apiUrl + '/api/auth';
//   private refreshTimer: any;
//   private refreshBuffer = 15 * 1000; // 15 seconds before expiry
//   private activityTimeout: any;
//   private readonly activityEvents = ['mousemove', 'keydown', 'click'];

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private authService: AuthService,
//     private ngZone: NgZone
//   ) {
//     this.initActivityListeners();
//   }

//   startWatching(): void {
//     this.scheduleRefresh();
//   }

//   stopWatching(): void {
//     if (this.refreshTimer) clearTimeout(this.refreshTimer);
//     if (this.activityTimeout) clearTimeout(this.activityTimeout);
//   }

//   private initActivityListeners(): void {
//     this.activityEvents.forEach(event => {
//       window.addEventListener(event, () => {
//         localStorage.setItem('userActive', 'true');
//       });
//     });

//     document.addEventListener('visibilitychange', () => {
//       if (document.visibilityState === 'visible') {
//         localStorage.setItem('userActive', 'true');
//       }
//     });
//   }

//   private scheduleRefresh(): void {
//     this.stopWatching();

//     const expiry = this.authService.getTokenExpiry();
//     if (!expiry) return;

//     const delay = expiry - this.refreshBuffer - Date.now();

//     console.log(`[TokenRefreshService] Scheduling refresh in ${delay / 1000}s`);

//     if (delay <= 0) {
//       this.evaluateAndRefresh();
//     } else {
//       this.ngZone.runOutsideAngular(() => {
//         this.refreshTimer = setTimeout(() => this.evaluateAndRefresh(), delay);
//       });
//     }
//   }

//   private evaluateAndRefresh(): void {
//     const isUserActive = localStorage.getItem('userActive') === 'true';

//     console.log(`[TokenRefreshService] User Active: ${isUserActive}`);

//     if (isUserActive) {
//       this.refreshAccessToken();
//     } else {
//       this.logoutUser();
//     }
//   }

//   private refreshAccessToken(): void {
//     console.log('[TokenRefreshService] Refreshing access token...');

//     this.http.post(`${this.baseUrl}/refresh-token`, {}, { withCredentials: true })
//       .subscribe({
//         next: (res: any) => {
//           const newAccessToken = res.body?.accessToken;
//           if (newAccessToken) {
//             localStorage.setItem('accessToken', newAccessToken)
//             localStorage.setItem('userActive', 'false')
//             this.scheduleRefresh();
//             console.log('[TokenRefreshService] Access token refreshed.');
//           } else {
//             this.logoutUser();
//           }
//         },
//         error: (err) => {
//           console.error('[TokenRefreshService] Refresh failed.', err);
//           this.logoutUser();
//         }
//       });
//   }

//   private logoutUser(): void {
//     console.warn('[TokenRefreshService] Logging out due to inactivity or token failure.');

//     this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
//       .subscribe({
//         next: () => {
//           this.authService.clearLocalStorage();
//           this.router.navigate(['/login']);
//         },
//         error: () => {
//           this.authService.clearLocalStorage();
//           this.router.navigate(['/login']);
//         }
//       });
//   }
// }
