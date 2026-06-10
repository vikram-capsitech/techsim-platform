import axios from 'axios';

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

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// Request interceptor to attach Authorization and API keys automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Only attach AI keys to AI endpoints
    const url = config.url || '';
    if (url.includes('/api/ai') || url.includes('api/ai')) {
      const groqKey = localStorage.getItem('groq_api_key');
      if (groqKey) {
        config.headers.set('X-Groq-API-Key', groqKey);
      }

      const geminiKey = localStorage.getItem('gemini_api_key');
      if (geminiKey) {
        config.headers.set('X-Gemini-API-Key', geminiKey);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract server error message or use fallback
    const message = error.response?.data?.error ?? error.response?.data?.message ?? error.message;
    return Promise.reject(new Error(message));
  }
);

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
  register: async (username: string, email: string, password: string) => {
    const res = await apiClient.post<{ token: string; user: AuthUser }>('/api/auth/register', {
      username,
      email,
      password,
    });
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ token: string; user: AuthUser }>('/api/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get<AuthUser>('/api/auth/me');
    return res.data;
  },

  updateProfile: async (username: string, email: string) => {
    const res = await apiClient.put<AuthUser>('/api/auth/profile', {
      username,
      email,
    });
    return res.data;
  },
};

// ── Diagrams ─────────────────────────────────────────────────────────────────
export type DiagramSummary = {
  _id: string;
  title: string;
  module: string;
  thumbnailUrl?: string;
  updatedAt: string;
  forkCount?: number;
  isPublic?: boolean;
};

export type DiagramVersion = {
  canvasJson: { nodes: any[]; edges: any[] };
  savedAt: string;
  label: string;
};

export const diagramApi = {
  save: async (title: string, module: string, canvasJson: any, thumbnailUrl?: string) => {
    const res = await apiClient.post<any>('/api/diagrams', {
      title,
      module,
      canvasJson,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    });
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<any>(`/api/diagrams/${id}`);
    return res.data;
  },

  update: async (id: string, title: string, canvasJson: any, thumbnailUrl?: string) => {
    const res = await apiClient.put<any>(`/api/diagrams/${id}`, {
      title,
      canvasJson,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    });
    return res.data;
  },

  autosave: async (id: string, canvasJson: any) => {
    const res = await apiClient.put<any>(`/api/diagrams/${id}/autosave`, {
      canvasJson,
    });
    return res.data;
  },

  list: async () => {
    const res = await apiClient.get<{ id: string; title: string; module: string; updatedAt: string }[]>('/api/diagrams');
    return res.data;
  },

  my: async () => {
    const res = await apiClient.get<DiagramSummary[]>('/api/diagrams/my');
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/api/diagrams/${id}`);
    return res.data;
  },

  fork: async (id: string) => {
    const res = await apiClient.post<DiagramSummary>(`/api/diagrams/${id}/fork`);
    return res.data;
  },

  versions: async (id: string) => {
    const res = await apiClient.get<DiagramVersion[]>(`/api/diagrams/${id}/versions`);
    return res.data;
  },

  restore: async (id: string, idx: number) => {
    const res = await apiClient.post<any>(`/api/diagrams/${id}/restore/${idx}`);
    return res.data;
  },
};

// ── AI Services ─────────────────────────────────────────────────────────────
export const aiApi = {
  chat: async (params: {
    message: string;
    architectureContext: any;
    conversationHistory: { role: string; content: string }[];
  }) => {
    const res = await apiClient.post<{ response: string }>('/api/ai/chat', params);
    return res.data;
  },

  wizard: async (data: any) => {
    const res = await apiClient.post<{ nodes: any[]; edges: any[] }>('/api/ai/wizard', data);
    return res.data;
  },

  generate: async (prompt: string, module = 'system_design') => {
    const res = await apiClient.post<any>('/api/ai/generate', { prompt, module });
    return res.data;
  },

  simulationReport: async (data: any) => {
    const res = await apiClient.post<{ report: string }>('/api/ai/simulation-report', data);
    return res.data;
  },

  chaosExplain: async (params: {
    chaosType: string;
    nodeName: string;
    nodeType: string;
    architectureContext: {
      totalNodes: number;
      connectedNodes: string[];
    };
  }) => {
    const res = await apiClient.post<{ explanation: string }>('/api/ai/chaos-explain', params);
    return res.data;
  },
};

// ── Feedback ────────────────────────────────────────────────────────────────
export const feedbackApi = {
  submit: async (data: {
    type: string;
    title: string;
    description: string;
    email?: string;
    priority: string;
    page: string;
    userAgent: string;
    timestamp: string;
  }) => {
    const res = await apiClient.post<any>('/api/feedback', data);
    return res.data;
  },
};

export default apiClient;
