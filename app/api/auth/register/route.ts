import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/schemas/auth";
import { ok, fail } from "@/lib/api-response";
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid JSON body", 400);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return fail("Validation failed", 422, parsed.error.flatten());
  const { firstName, lastName, email, phoneNumber, password } = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
  if (existing) return fail("Email or phone number already in use", 409);
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, phoneNumber, passwordHash }
  });
  const token = signToken({ id: user.id, role: "user", email: user.email });
  return ok({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
  }, 201);
}
