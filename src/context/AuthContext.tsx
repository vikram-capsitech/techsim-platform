import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi, clearToken, getToken, setToken } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    authApi.me()
      .then((u) => setUser(normalise(u)))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password);
    setToken(token);
    setUser(normalise(u));
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { token, user: u } = await authApi.register(username, email, password);
    setToken(token);
    setUser(normalise(u));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => {
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Server can return _id (from /me Mongoose doc) or id (from login/register)
function normalise(u: Record<string, unknown>): User {
  return {
    _id:      (u._id ?? u.id ?? '') as string,
    id:       (u.id  ?? u._id ?? '') as string,
    username: u.username as string,
    email:    u.email as string,
    avatarUrl: u.avatarUrl as string | undefined,
    plan:      u.plan as string | undefined,
  };
}
