import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import type { ApiResponse, AuthResponse, LoginDto, RegisterDto } from '@annota/shared';

const TOKEN_KEY = 'annota_token';
const USER_KEY = 'annota_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  private readonly _user = signal<AuthResponse['user'] | null>(this.loadUser());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  login(dto: LoginDto) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, dto)
      .pipe(tap((res) => this.saveSession(res.data)));
  }

  register(dto: RegisterDto) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/register`, dto)
      .pipe(tap((res) => this.saveSession(res.data)));
  }

  getMe() {
    return this.http
      .get<ApiResponse<AuthResponse['user']>>(`${this.apiUrl}/auth/me`)
      .pipe(tap((res) => this._user.set(res.data)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private saveSession(auth: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    this._user.set(auth.user);
  }

  private loadUser(): AuthResponse['user'] | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
