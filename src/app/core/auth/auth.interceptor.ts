import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService)
//   // const token = authService.getToken();
//   const token = authService.getAccessToken();

//   if (token) {
//     const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
//     return next(authReq);
//   }
//   return next(req);
// };

// 1. Export a constant that is of type HttpInterceptorFn
export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {

  // 2. Use inject() to get dependencies inside the function
  const authService = inject(AuthService);
  const router = inject(Router);

  // Helper method moved inside or kept private outside if needed,
  // but for simplicity in functional interceptors, often declared here
  const addToken = (req: HttpRequest<any>, token: string | null): HttpRequest<any> => {
    if (token) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return req;
  };

  // 3. Add the current access token to the outgoing request
  let authReq = addToken(request, authService.getAccessToken());

  // 4. Handle the request and catch potential errors
  return next(authReq).pipe( // Call next() as a function now (HttpHandlerFn)
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error?.message !== 'Invalid credentials' && authService.getAccessToken()) {
        console.warn('401 Unauthorized detected. Attempting to refresh token...');

        return authService.refreshToken().pipe(
          switchMap(newToken => {
            console.log('Token refreshed. Retrying original request...');
            authReq = addToken(request, newToken); // Add new token to original request
            return next(authReq); // Retry the request
          }),
          catchError((refreshError: any) => {
            console.error('Refresh token failed. Logging out...', refreshError);
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      } else if (error.status === 403) {
        console.error('403 Forbidden. User not authorized to access this resource.', error);
        router.navigate(['/forbidden']);
        return throwError(() => error);
      } else if (error.status === 401 && error.error?.message === 'Invalid credentials') {
        console.warn('401 due to invalid credentials, not an expired token. Not refreshing.');
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};