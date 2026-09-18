"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, type SessionRole } from "@/contexts/auth-context";
export function useRequireRole(role: SessionRole) {
  const { session, ready } = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== role) router.replace("/forbidden");
  }, [ready, session, role, router]);
  return { session: session && session.role === role ? session : null, ready };
}
