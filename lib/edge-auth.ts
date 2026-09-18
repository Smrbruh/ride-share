import { jwtVerify } from "jose";
const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);
export async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, encodedSecret);
    return true;
  } catch {
    return false;
  }
}
export function extractBearerTokenEdge(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
