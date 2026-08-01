"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: string;
  phoneVerified?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (input: { firstName: string; lastName: string; phone: string; email?: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "kj_auth_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.accessToken);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  function persist(nextUser: AuthUser, accessToken: string) {
    setUser(nextUser);
    setToken(accessToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, accessToken }));
  }

  async function login(phone: string, password: string) {
    const data = await apiFetch<{ user: AuthUser; accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    persist(data.user, data.accessToken);
  }

  async function register(input: { firstName: string; lastName: string; phone: string; email?: string; password: string }) {
    const data = await apiFetch<{ user: AuthUser; accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    persist(data.user, data.accessToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
