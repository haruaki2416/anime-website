"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, AccountData } from "@/app/lib/railwayApi";

export type AuthUser = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  data: AccountData;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateData: (data: Partial<AccountData>) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await apiRequest<{ user: AuthUser }>("/auth/me");
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ user: AuthUser }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    });
    setUser(result.user);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const result = await apiRequest<{ user: AuthUser }>("/auth/register", {
      method: "POST", body: JSON.stringify({ email, username, password }),
    });
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const updateData = useCallback(async (data: Partial<AccountData>) => {
    const result = await apiRequest<{ data: AccountData }>("/auth/data", {
      method: "PATCH", body: JSON.stringify({ data }),
    });
    setUser((current) => current ? { ...current, data: result.data } : current);
  }, []);

  const deleteAccount = useCallback(async () => {
    await apiRequest("/auth/account", { method: "DELETE" });
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, refresh, login, register, logout, updateData, deleteAccount }),
    [user, loading, refresh, login, register, logout, updateData, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
