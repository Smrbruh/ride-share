"use client";
import * as React from "react";
import { getStoredSession, setSession, clearSession, getToken } from "@/lib/api-client";
export type SessionRole = "user" | "driver" | "admin";
export interface SessionUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
export interface Session {
  role: SessionRole;
  user: SessionUser;
}
interface AuthContextValue {
  session: Session | null;
  ready: boolean;
  login: (token: string, session: Session) => void;
  logout: () => void;
}
const AuthContext = React.createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = React.useState<Session | null>(null);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const token = getToken();
    const stored = getStoredSession<Session>();
    if (token && stored) setSessionState(stored);
    setReady(true);
  }, []);
  const login = React.useCallback((token: string, nextSession: Session) => {
    setSession(token, nextSession);
    setSessionState(nextSession);
  }, []);
  const logout = React.useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);
  return <AuthContext.Provider value={{ session, ready, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
