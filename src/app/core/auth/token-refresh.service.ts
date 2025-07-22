import { inject, Injectable, NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {

  private readonly baseUrl = environment.apiUrl + '/api/auth';

  private refreshTimer: any;
  private refreshBuffer = 60 * 1000;

  private authService = inject(AuthService);
  private router = inject(Router)
  private ngZone = inject(NgZone)
  private http = inject(HttpClient)


  constructor() { }

  startWatching() {
    this.scheduleRefresh();
  }

  stopWatching() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
  }

  private scheduleRefresh() {
    this.stopWatching()

    const expiry = this.authService.getTokenExpiry();

    if (!expiry) return;

    const now = Date.now();
    const refreshTime = expiry - this.refreshBuffer;
    const delay = refreshTime - now;

    if (delay <= 0) {
      this.refreshTokenIfActive();
    } else {
      this.ngZone.runOutsideAngular(() => {
        this.refreshTimer = setTimeout(() => {
          this.refreshTokenIfActive();
        }, delay);
      });
    }
  }

  private refreshTokenIfActive() {
    if (document.hasFocus()) {
      this.http.post(`${this.baseUrl}/refresh-token`, {}, { withCredentials: true })
        .subscribe({
          next: (res: any) => {
            localStorage.setItem('accessToken', res.body.accessToken);
            this.scheduleRefresh();
          },
          error: (err) => {
            this.router.navigate(['/dashboard'])
            console.error('Refresh token failed', err);
          }
        });

    } else {
      window.addEventListener('focus', () => {
        this.refreshTokenIfActive();
      }, { once: true });
    }
  }

}
