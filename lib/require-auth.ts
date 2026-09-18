import { NextRequest } from "next/server";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import type { AuthRole, JwtPayload } from "@/types";
export function requireAuth(request: NextRequest, allowedRoles: AuthRole[]): JwtPayload | null {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (!allowedRoles.includes(payload.role)) return null;
  return payload;
}
