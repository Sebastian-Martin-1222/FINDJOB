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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://findjob-api-audit-2k2ft2tdxq-uc.a.run.app/api/v1";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  retryOn401?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      authStorage.clearSession();
      return null;
    }

    const data = await response.json();
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

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, retryOn401 = true, headers = {}, ...rest } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = authStorage.getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: requestHeaders,
      ...rest,
    });
  } catch (err) {
    throw new ApiError("Error de conectividad de red con el servidor FindJob.", 0, err);
  }

  // Manejo de expiración / rotación de token (401)
  if (response.status === 401 && requiresAuth && retryOn401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAuthToken();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        return request<T>(endpoint, { ...options, retryOn401: false });
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        refreshSubscribers.push(async (newToken) => {
          try {
            const retryRes = await request<T>(endpoint, {
              ...options,
              headers: {
                ...(headers as Record<string, string>),
                Authorization: `Bearer ${newToken}`,
              },
              retryOn401: false,
            });
            resolve(retryRes);
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    let errorDetails: unknown = null;
    try {
      const errJson = await response.json();
      errorDetails = errJson;
      errorMessage = errJson.detail || errJson.message || errorMessage;
    } catch {
      // Ignora error de parseo si la respuesta no es JSON
    }
    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
