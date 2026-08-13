"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/services/auth.service";

const AuthContext = createContext(null);

const TOKEN_KEY = "synqro_access_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    window.localStorage.setItem(TOKEN_KEY, result.access_token);
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // proceed with local logout regardless of API result
    }
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh: loadCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
