// import { Injectable } from '@angular/core';
// import { environment } from '../../../environments/environment';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
// import { AuthResponse } from '../models/auth-response.model';
// import { RegisterRequest } from '../models/register-request.model';

import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, finalize, map, Observable, take, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { UserInfo } from "../models/user-info.model";

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private readonly baseUrl = environment.apiUrl + '/api/auth';

//   private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
//   isLoggedIn$ = this.isLoggedInSubject.asObservable();

//   constructor(private http: HttpClient) { }

//   register(data: RegisterRequest): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data, { withCredentials: true }).pipe(
//       tap((response: AuthResponse) => {
//         localStorage.setItem('accessToken', response.accessToken);
//         localStorage.setItem('username', response.username);
//         localStorage.setItem('email', response.email);
//         localStorage.setItem('role', response.role);
//         this.isLoggedInSubject.next(true);
//       })
//     );
//   }


//   login(email: string, password: string): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }, { withCredentials: true }).pipe(
//       tap((response: AuthResponse) => {
//         localStorage.setItem('accessToken', response.accessToken);
//         localStorage.setItem('username', response.username);
//         localStorage.setItem('email', response.email);
//         localStorage.setItem('role', response.role);
//         this.isLoggedInSubject.next(true);
//       })
//     );
//   }

//   logout() {
//     return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
//       tap(() => {
//         this.clearLocalStorage();
//         this.isLoggedInSubject.next(false);
//       }),
//       catchError(error => {
//         return throwError(() => error);
//       })
//     );
//   }

//   getToken(): string | null {
//     return localStorage.getItem('accessToken');
//   }

//   getUserInfo(): { username: string; mail: string; role: string } {
//     return {
//       username: localStorage.getItem('username') ?? '',
//       mail: localStorage.getItem('email') ?? '',
//       role: localStorage.getItem('role') ?? ''
//     };
//   }


//   getTokenExpiry(): number | null {
//     const token = this.getToken();
//     if (!token) return null;

//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.exp * 1000;
//     } catch {
//       return null;
//     }
//   }

//   clearLocalStorage() {
//     localStorage.clear();
//     this.isLoggedInSubject.next(false);
//   }

//   private hasValidToken(): boolean {
//     const expiry = this.getTokenExpiry();
//     return expiry ? Date.now() < expiry : false;
//   }

// }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl + '/api/auth';
  private accessTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public accessToken$: Observable<string | null> = this.accessTokenSubject.asObservable();

  private isRefreshing = false;

  // --- Activity Monitoring Properties ---
  private activityTimer: any; // Holds the timeout ID for inactivity
  private lastActivityTime = Date.now(); // Stores timestamp of last user interaction
  private inactivityThreshold = 10 * 60 * 1000; // 10 minutes (in milliseconds) of inactivity
  private proactiveRefreshInterval: any; // Holds the interval ID for proactive refresh check

  // For `resetActivityTimerBound` to work correctly with event listeners
  private resetActivityTimerBound: () => void;

  constructor(private http: HttpClient) {
    this.loadAccessTokenFromStorage();
    this.resetActivityTimerBound = this.resetActivityTimer.bind(this); // Bind it once
    this.loadAccessTokenFromStorage();
    this.startActivityMonitoring();
    this.scheduleProactiveTokenRefresh();
  }


  private loadAccessTokenFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.accessTokenSubject.next(token);
      console.log('Access token loaded from storage.');
    } else {
      console.log('No access token found in storage.');
    }
  }

  public getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  public setAccessToken(token: string | null): void {
    if (token) {
      localStorage.setItem('accessToken', token);
      console.log('Access token set and stored.');
    } else {
      localStorage.removeItem('accessToken');
      console.log('Access token removed from storage.');
    }
    this.accessTokenSubject.next(token);
  }


  public login(email: string, password: string): Observable<any> {
    console.log('Attempting login...');
    return this.http.post(`${this.baseUrl}/login`, { email, password }, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response && response.accessToken) {
          this.setAccessToken(response.accessToken);
          console.log('Login successful, token received and set.');
        } else {
          console.warn('Login successful but no access token received in response.');
          throw new Error('No access token received from login.');
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Login failed. Please check your credentials.'));
      })
    );
  }

  public logout(): void {
    console.log('Attempting logout...');
    this.setAccessToken(null); // Use our setAccessToken method to clear the token
    // Optional: Make a call to your backend to invalidate the refresh token if applicable
    // this.http.post(`${environment.apiUrl}/logout`, {}).subscribe({
    //   next: () => console.log('Backend logout successful (refresh token revoked).'),
    //   error: (err) => console.error('Backend logout failed:', err)
    // });
    console.log('User successfully logged out.');
  }

  public refreshToken(): Observable<string> {
    if (this.isRefreshing) {
      return this.accessToken$.pipe(
        filter(token => token != null),
        take(1)
      ) as Observable<string>;
    }

    this.isRefreshing = true;
    console.log('Initiating token refresh request...');

    return this.http.post(`${this.baseUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response) {
          this.setAccessToken(response)
        }
      }),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Session expired. Please log in again.'))
      }),
      finalize(() => {
        this.isRefreshing = false;
        console.log('Token refresh attempt completed.');
      })
    )
  }

  /**
  * Starts listening for user activity events.
  * Call this on service initialization and successful login.
  */
  private startActivityMonitoring(): void {
    // Ensure existing listeners/timers are cleared to prevent duplicates
    this.stopActivityMonitoring();
  }


  /**
   * Stops listening for user activity events and clears the inactivity timer.
   * Call this on logout or application shutdown.
   */
  private stopActivityMonitoring(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    // Remove event listeners to prevent memory leaks if service is destroyed
    // (though for root-provided service, it lives for app's lifetime)
    document.removeEventListener('mousemove', this.resetActivityTimerBound);
    document.removeEventListener('keydown', this.resetActivityTimerBound);
    document.removeEventListener('click', this.resetActivityTimerBound);
    document.removeEventListener('scroll', this.resetActivityTimerBound);
  }


  /**
   * Resets the inactivity timer and updates the last activity timestamp.
   * This is called by the activity event listeners.
   */
  private resetActivityTimer(): void {
    this.lastActivityTime = Date.now();
    // Clear the previous timeout and set a new one
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    this.activityTimer = setTimeout(() => {
      console.warn('User has crossed inactivity threshold.');
    }, this.inactivityThreshold);
  }

  /**
   * Checks if the user has been active within the defined threshold.
   * @returns True if active, false otherwise.
   */
  public isUserActive(): boolean {
    return (Date.now() - this.lastActivityTime) < this.inactivityThreshold;
  }


  /**
   * Schedules a periodic check to refresh the token before it expires,
   * but only if the user is active.
   */
  private scheduleProactiveTokenRefresh(): void {
    this.stopProactiveTokenRefresh(); // Clear any existing interval

    // We'll check every 5 minutes (or adjust as needed)
    this.proactiveRefreshInterval = setInterval(() => {
      // Only attempt proactive refresh if we have a token AND the user is active
      if (this.accessTokenSubject.value && this.isUserActive()) {
        const decodedToken = this.decodeToken(this.accessTokenSubject.value);
        const expiresAt = decodedToken ? decodedToken.exp * 1000 : 0; // exp is in seconds (JWT standard)
        const currentTime = Date.now();
        const refreshThreshold = 5 * 60 * 1000; // Try to refresh 5 minutes before actual expiry

        if (expiresAt > 0 && (expiresAt - currentTime) < refreshThreshold) {
          console.log('Access token nearing expiration for active user, attempting proactive refresh...');
          this.refreshToken().subscribe({
            next: () => console.log('Proactive refresh successful.'),
            error: err => console.error('Proactive refresh failed:', err)
          });
        }
      } else if (!this.isUserActive()) {
        console.log('User inactive, pausing proactive token refresh check.');
      }
    }, 60 * 1000); // Check every 1 minute
  }

  /**
   * Stops the proactive token refresh interval.
   */
  private stopProactiveTokenRefresh(): void {
    if (this.proactiveRefreshInterval) {
      clearInterval(this.proactiveRefreshInterval);
      this.proactiveRefreshInterval = null;
    }
  }

  /**
   * Helper to decode JWT to get expiration time.
   */
  private decodeToken(token: string): any {
    try {
      // JWTs are base64-encoded, split at '.', payload is the second part
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }


  public getUserInfo(): Observable<UserInfo | null> {
    return this.accessToken$.pipe(
      map(token => {
        if (!token) {
          return null;
        }
        const decoded = this.decodeToken(token);
        if (decoded) {
          return {
            username: decoded.sub
          } as UserInfo;
        }
        return null;
      })
    );
  }
}
