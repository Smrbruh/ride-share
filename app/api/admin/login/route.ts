import { NextRequest } from "next/server";
import { verifyPassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth";
import { adminRepository } from "@/repositories/admin.repository";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
export const POST = handleRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return failure("Validation failed", 422, "VALIDATION_ERROR", parsed.error.flatten());
  const { email, password } = parsed.data;
  const admin = await adminRepository.findByEmail(email);
  if (!admin) return failure("Invalid credentials", 401, "UNAUTHORIZED");
  const validPassword = await verifyPassword(password, admin.passwordHash);
  if (!validPassword) return failure("Invalid credentials", 401, "UNAUTHORIZED");
  const token = signToken({ id: admin.id, role: "admin", email: admin.email });
  return success({
    token,
    admin: { id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, role: admin.role }
  });
});
