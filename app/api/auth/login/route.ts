import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth";
import { ok, fail } from "@/lib/api-response";
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid JSON body", 400);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Validation failed", 422, parsed.error.flatten());
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail("Invalid credentials", 401);
  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) return fail("Invalid credentials", 401);
  if (user.status !== "active") return fail("Account is not active", 403);
  const token = signToken({ id: user.id, role: "user", email: user.email });
  return ok({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
  });
}
