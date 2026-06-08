const API_URL = (import.meta as { env: Record<string, string> }).env.VITE_API_URL ?? 'http://localhost:5000';
const TOKEN_KEY = 'techsim_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, string>;
    // Server returns { error: "..." } — fall back to message or status
    throw new Error(body.error ?? body.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type AuthUser = {
  _id: string;
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  plan?: string;
};

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<AuthUser>('/api/auth/me'),
};

// ── Diagrams ─────────────────────────────────────────────────────────────────
export const diagramApi = {
  save: (title: string, module: string, canvasJson: string) =>
    request<{ id: string }>('/api/diagrams', {
      method: 'POST',
      body: JSON.stringify({ title, module, canvasJson }),
    }),

  list: () =>
    request<{ id: string; title: string; module: string; updatedAt: string }[]>('/api/diagrams'),
};
