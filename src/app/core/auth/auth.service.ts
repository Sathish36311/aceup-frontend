import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiUrl + '/api/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }, { withCredentials: true }).pipe(
      tap((response: AuthResponse) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('username', response.username);
        localStorage.setItem('email', response.email);
        localStorage.setItem('role', response.role);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUserInfo(): { username: string; mail: string; role: string } {
    return {
      username: localStorage.getItem('username') ?? '',
      mail: localStorage.getItem('email') ?? '',
      role: localStorage.getItem('role') ?? ''
    };
  }

  removeToken(): void {
    localStorage.removeItem('accessToken');
  }

  getTokenExpiry(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

}
