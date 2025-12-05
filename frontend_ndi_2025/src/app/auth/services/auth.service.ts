import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl + '/api/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;
  bio?: string;
  ville?: string;
  promo?: string;
  role: string;
  isVerified: boolean;
  xpTotal: number;
  niveau: number;
  talentId?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  ville?: string;
  promo?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  /**
   * Charger l'utilisateur stocké au démarrage
   */
  private loadStoredUser(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('🔐 [AUTH] Utilisateur restauré:', user.username);
      } catch {
        this.logout();
      }
    }
  }

  /**
   * Inscription
   */
  async register(data: RegisterData): Promise<User> {
    console.log('📝 [AUTH] Inscription...', data.email);

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${API_URL}/register`, data)
      );

      this.setSession(response);
      console.log('✅ [AUTH] Inscription réussie:', response.user.username);

      return response.user;
    } catch (error: any) {
      console.error('❌ [AUTH] Erreur inscription:', error.error?.message || error.message);
      throw error;
    }
  }

  /**
   * Connexion
   */
  async login(data: LoginData): Promise<User> {
    console.log('🔐 [AUTH] Connexion...', data.email);

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${API_URL}/login`, data)
      );

      this.setSession(response);
      console.log('✅ [AUTH] Connexion réussie:', response.user.username);

      return response.user;
    } catch (error: any) {
      console.error('❌ [AUTH] Erreur connexion:', error.error?.message || error.message);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  logout(): void {
    console.log('👋 [AUTH] Déconnexion');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Récupérer le profil actuel
   */
  async getProfile(): Promise<User> {
    const response = await firstValueFrom(
      this.http.get<User>(`${API_URL}/profile`, {
        headers: this.getAuthHeaders()
      })
    );
    
    this.currentUserSubject.next(response);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
    
    return response;
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await firstValueFrom(
      this.http.put<User>(`${API_URL}/profile`, data, {
        headers: this.getAuthHeaders()
      })
    );
    
    this.currentUserSubject.next(response);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
    
    return response;
  }

  /**
   * Vérifier si connecté
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtenir le token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Obtenir les headers d'authentification
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Sauvegarder la session
   */
  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticatedSubject.next(true);
  }
}

