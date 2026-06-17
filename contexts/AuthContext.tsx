import React, { createContext, useContext, useState, useCallback } from 'react';

import { User, api } from '@/services/api';

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    applySession(session.token, session.user);
  }, [applySession]);

  const register = useCallback(async (input: { name: string; email: string; password: string }) => {
    const session = await api.register(input);
    applySession(session.token, session.user);
  }, [applySession]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await api.me(token);
    setUser(response.user);
  }, [token]);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    if (!token) {
      throw new Error('Voce precisa estar logado.');
    }

    const response = await api.updateMe(token, patch);
    setUser(response.user);
  }, [token]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.logout(token);
      }
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      token,
      user,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
