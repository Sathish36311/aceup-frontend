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
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
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
      mail: localStorage.getItem('mail') ?? '',
      role: localStorage.getItem('role') ?? ''
    };
  }
}
