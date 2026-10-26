import { apiClient } from "@/lib/api-client";
import { authStorage, AuthUser } from "@/lib/auth-storage";
import { LoginInput, RegisterInput } from "@/schemas/auth.schema";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterResponse {
  usuario: AuthUser;
  tokens: TokenResponse;
}

export const authService = {
  /**
   * Inicia sesión validando credenciales y almacenando el token en memoria (Evidencia 1 de 82)
   */
  async login(credentials: LoginInput): Promise<TokenResponse> {
    const data = await apiClient.post<TokenResponse>("/auth/login", credentials, {
      requiresAuth: false,
    });

    // Guardar tokens en memoria volátil segura
    authStorage.setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });

    // Obtener y vincular perfil del usuario actual
    try {
      const userProfile = await apiClient.get<AuthUser>("/me", { requiresAuth: true });
      authStorage.setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        user: userProfile,
      });
    } catch {
      // Si /me falla temporalmente, la sesión permanece activa con tokens
    }

    return data;
  },

  /**
   * Registra una nueva cuenta de usuario con rol inicial (Evidencia 2 de 82)
   */
  async register(payload: RegisterInput): Promise<RegisterResponse> {
    const cleanPayload = {
      ...payload,
      telefono: payload.telefono ? payload.telefono : null,
    };

    const data = await apiClient.post<RegisterResponse>("/auth/register", cleanPayload, {
      requiresAuth: false,
    });

    authStorage.setSession({
      accessToken: data.tokens.access_token,
      refreshToken: data.tokens.refresh_token,
      expiresIn: data.tokens.expires_in,
      user: data.usuario,
    });

    return data;
  },

  /**
   * Renueva la sesión activa mediante refresh token (Evidencia 3 de 82)
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No hay un refresh token disponible en la sesión.");
    }

    const data = await apiClient.post<TokenResponse>(
      "/auth/refresh",
      { refresh_token: refreshToken },
      { requiresAuth: false }
    );

    authStorage.setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });

    return data;
  },

  /**
   * Cierra la sesión activa y revoca el token en el backend (Evidencia 4 de 82)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {}, { requiresAuth: true });
    } catch {
      // Incluso si la revocación en red falla, se limpia la sesión localmente
    } finally {
      authStorage.clearSession();
    }
  },
};
