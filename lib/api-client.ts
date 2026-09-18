const TOKEN_KEY = "ride_app_token";
const SESSION_KEY = "ride_app_session";
export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setSession(token: string, session: unknown) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
export function getStoredSession<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}
interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let hadToken = false;
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      hadToken = true;
    }
  }
  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (json && (json.message || json.error)) || "Request failed";
    if (response.status === 401 && hadToken && typeof window !== "undefined") {
      clearSession();
      window.location.href = "/login?expired=1";
    }
    throw new ApiError(message, response.status, json?.details);
  }
  if (json && typeof json === "object" && "success" in json) {
    return json.data as T;
  }
  return json as T;
}
