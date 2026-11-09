import { authStorage } from "./auth-storage";

export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://findjob-api-audit-2k2ft2tdxq-uc.a.run.app/api/v1"
).replace(/\/$/, "");

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  retryOn401?: boolean;
}

interface TokenPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

let refreshPromise: Promise<string | null> | null = null;

function buildApiUrl(endpoint: string): string {
  const normalized = endpoint.trim();
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("//")) {
    throw new ApiError("El cliente API solo permite rutas relativas del backend configurado.", 0);
  }
  return `${BASE_URL}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
}

function normalizeBackendError(payload: unknown, status: number): string {
  if (status >= 500) return "No fue posible completar la operación por un error del servidor.";

  const candidate = payload && typeof payload === "object"
    ? payload as { detail?: unknown; message?: unknown; error?: { message?: unknown } }
    : null;

  if (candidate) {
    if (typeof candidate.detail === "string") return candidate.detail;
    if (typeof candidate.message === "string") return candidate.message;
    if (candidate.error && typeof candidate.error.message === "string") return candidate.error.message;
  }

  if (status === 401) return "No fue posible validar tus credenciales o tu sesión expiró.";
  if (status === 403) return "No tienes permisos para realizar esta acción.";
  if (!candidate) return `Error HTTP ${status}`;

  if (Array.isArray(candidate.detail)) {
    const messages = candidate.detail
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const msg = (item as { msg?: unknown }).msg;
        return typeof msg === "string" ? msg : null;
      })
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length) return messages.join(" ");
  }

  return `Error HTTP ${status}`;
}

function isTokenPayload(value: unknown): value is TokenPayload {
  if (!value || typeof value !== "object") return false;
  const token = value as Partial<TokenPayload>;
  return Boolean(
    token.access_token &&
      token.refresh_token &&
      typeof token.expires_in === "number" &&
      Number.isFinite(token.expires_in) &&
      token.expires_in > 0
  );
}

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    authStorage.clearSession();
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      authStorage.clearSession();
      return null;
    }
    const data: unknown = await response.json();
    if (!isTokenPayload(data)) {
      authStorage.clearSession();
      return null;
    }
    authStorage.setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });
    return data.access_token;
  } catch {
    authStorage.clearSession();
    return null;
  }
}

function getSharedRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAuthToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, retryOn401 = true, headers, ...rest } = options;
  const url = buildApiUrl(endpoint);
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (rest.body !== undefined && rest.body !== null && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = authStorage.getAccessToken();
    if (token && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { ...rest, headers: requestHeaders });
  } catch (error) {
    throw new ApiError("No fue posible conectar con el servidor FindJob.", 0, error);
  }

  if (response.status === 401 && requiresAuth && retryOn401) {
    const newToken = await getSharedRefresh();
    if (!newToken) throw new ApiError("Tu sesión ha expirado. Inicia sesión nuevamente.", 401);
    const retryHeaders = new Headers(headers);
    retryHeaders.set("Authorization", `Bearer ${newToken}`);
    return request<T>(endpoint, { ...options, headers: retryHeaders, retryOn401: false });
  }

  if (!response.ok) {
    let details: unknown = null;
    try {
      details = await response.json();
    } catch {
      // Cuerpo no JSON.
    }
    throw new ApiError(normalizeBackendError(details, response.status), response.status, details);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError("El servidor devolvió un formato de respuesta inesperado.", response.status);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ApiError("El servidor devolvió una respuesta JSON no válida.", response.status, error);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "DELETE" }),
};
