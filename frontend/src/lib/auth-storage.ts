/**
 * Almacenamiento seguro de tokens y sesión en memoria volátil (OWASP).
 * Evita el almacenamiento de access tokens sensibles en localStorage para mitigar el riesgo de robo por XSS.
 */

export interface AuthUser {
  usuario_id: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  roles: string[];
}

export interface SessionData {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: AuthUser | null;
}

// Estado volátil en memoria
let sessionState: SessionData = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
};

// Suscriptores para reactividad de sesión
type SessionListener = (session: SessionData) => void;
const listeners = new Set<SessionListener>();

export const authStorage = {
  getSession(): SessionData {
    return { ...sessionState };
  },

  getAccessToken(): string | null {
    if (sessionState.expiresAt && Date.now() >= sessionState.expiresAt) {
      return null;
    }
    return sessionState.accessToken;
  },

  getRefreshToken(): string | null {
    return sessionState.refreshToken;
  },

  getUser(): AuthUser | null {
    return sessionState.user;
  },

  isAuthenticated(): boolean {
    return Boolean(sessionState.accessToken && (!sessionState.expiresAt || Date.now() < sessionState.expiresAt));
  },

  setSession(data: { accessToken: string; refreshToken?: string; expiresIn: number; user?: AuthUser }): void {
    const expiresAt = Date.now() + data.expiresIn * 1000 - 30000; // Margen de gracia de 30s
    sessionState = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? sessionState.refreshToken,
      expiresAt,
      user: data.user ?? sessionState.user,
    };
    listeners.forEach((listener) => listener(sessionState));
  },

  clearSession(): void {
    sessionState = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
    };
    listeners.forEach((listener) => listener(sessionState));
  },

  subscribe(listener: SessionListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
