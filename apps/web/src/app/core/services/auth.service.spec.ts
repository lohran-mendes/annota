import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import type { ApiResponse, AuthResponse, LoginDto } from '@annota/shared';

// Constantes que espelham as chaves usadas no service
const TOKEN_KEY = 'annota_token';
const USER_KEY = 'annota_user';

const mockUser: AuthResponse['user'] = {
  id: 'user-1',
  name: 'Anna Beatriz',
  email: 'anna@etec.com',
  role: 'student',
};

const mockAdminUser: AuthResponse['user'] = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@etec.com',
  role: 'admin',
};

const mockAuthResponse: AuthResponse = {
  accessToken: 'jwt-token-abc',
  user: mockUser,
};

const mockLoginDto: LoginDto = {
  email: 'anna@etec.com',
  password: 'senha123',
};

// Cria um localStorage mock limpo para cada test suite
function createLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    _store: store,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- login() ---

  describe('login()', () => {
    it('should POST to /auth/login with the provided credentials', () => {
      service.login(mockLoginDto).subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginDto);

      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);
    });

    it('should store the token in localStorage after a successful login', () => {
      service.login(mockLoginDto).subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, mockAuthResponse.accessToken);
    });

    it('should store the user as JSON in localStorage after a successful login', () => {
      service.login(mockLoginDto).subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        USER_KEY,
        JSON.stringify(mockUser),
      );
    });

    it('should update the user signal after a successful login', () => {
      expect(service.user()).toBeNull();

      service.login(mockLoginDto).subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);

      expect(service.user()).toEqual(mockUser);
    });
  });

  // --- logout() ---

  describe('logout()', () => {
    it('should remove token from localStorage', () => {
      service.logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    });

    it('should remove user from localStorage', () => {
      service.logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(USER_KEY);
    });

    it('should set user signal to null', () => {
      // Simula usuario logado
      service.login(mockLoginDto).subscribe();
      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);
      expect(service.user()).toEqual(mockUser);

      service.logout();

      expect(service.user()).toBeNull();
    });
  });

  // --- isAuthenticated ---

  describe('isAuthenticated', () => {
    it('should return false when no user is set', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true after a successful login', () => {
      service.login(mockLoginDto).subscribe();
      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false after logout', () => {
      service.login(mockLoginDto).subscribe();
      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  // --- isAdmin ---

  describe('isAdmin', () => {
    it('should return false when no user is set', () => {
      expect(service.isAdmin()).toBe(false);
    });

    it('should return false for a student user', () => {
      service.login(mockLoginDto).subscribe();
      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: mockAuthResponse } satisfies ApiResponse<AuthResponse>);

      expect(service.isAdmin()).toBe(false);
    });

    it('should return true for an admin user', () => {
      const adminAuthResponse: AuthResponse = {
        accessToken: 'admin-jwt',
        user: mockAdminUser,
      };

      service.login({ email: 'admin@etec.com', password: 'admin123' }).subscribe();
      const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
      req.flush({ data: adminAuthResponse } satisfies ApiResponse<AuthResponse>);

      expect(service.isAdmin()).toBe(true);
    });
  });

  // --- getToken() ---

  describe('getToken()', () => {
    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return the stored token', () => {
      localStorageMock._store[TOKEN_KEY] = 'stored-token';

      expect(service.getToken()).toBe('stored-token');
    });
  });

  // --- restore from localStorage on init ---

  describe('session restore on init', () => {
    it('should restore user from localStorage when USER_KEY is present', () => {
      // Pre-popula o localStorage antes de criar o service
      const freshMock = createLocalStorageMock();
      freshMock._store[USER_KEY] = JSON.stringify(mockUser);
      Object.defineProperty(window, 'localStorage', { value: freshMock, writable: true });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });

      const restoredService = TestBed.inject(AuthService);

      expect(restoredService.user()).toEqual(mockUser);
      expect(restoredService.isAuthenticated()).toBe(true);
    });

    it('should keep user null when USER_KEY contains invalid JSON', () => {
      const freshMock = createLocalStorageMock();
      freshMock._store[USER_KEY] = '{invalid json}}}';
      Object.defineProperty(window, 'localStorage', { value: freshMock, writable: true });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });

      const restoredService = TestBed.inject(AuthService);

      expect(restoredService.user()).toBeNull();
    });

    it('should keep user null when USER_KEY is absent', () => {
      const freshMock = createLocalStorageMock();
      Object.defineProperty(window, 'localStorage', { value: freshMock, writable: true });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });

      const restoredService = TestBed.inject(AuthService);

      expect(restoredService.user()).toBeNull();
    });
  });
});
