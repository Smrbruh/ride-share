import { NextRequest, NextResponse } from "next/server";
import { extractBearerTokenEdge, verifyTokenEdge } from "@/lib/edge-auth";
const ALWAYS_PROTECTED_PREFIXES = [
  "/api/bookings",
  "/api/ratings",
  "/api/vehicles",
  "/api/vehicle-types",
  "/api/admin",
  "/api/payments",
  "/api/drivers"
];
const PUBLIC_EXCEPTIONS = ["/api/admin/login"];
const WRITE_PROTECTED_PREFIXES = ["/api/locations", "/api/rides"];
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PUBLIC_EXCEPTIONS.some((exception) => path === exception)) return NextResponse.next();
  const isAlwaysProtected = ALWAYS_PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
  const isWriteProtected = WRITE_PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix)) && request.method !== "GET";
  if (!isAlwaysProtected && !isWriteProtected) return NextResponse.next();
  const token = extractBearerTokenEdge(request.headers.get("authorization"));
  if (!token || !(await verifyTokenEdge(token))) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/api/bookings/:path*",
    "/api/ratings/:path*",
    "/api/vehicles/:path*",
    "/api/vehicle-types/:path*",
    "/api/admin/:path*",
    "/api/payments/:path*",
    "/api/drivers/:path*",
    "/api/locations/:path*",
    "/api/rides/:path*"
  ]
};
