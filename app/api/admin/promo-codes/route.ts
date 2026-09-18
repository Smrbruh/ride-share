import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { promoCodeService } from "@/services/promoCode.service";
import { createPromoCodeSchema, promoCodeQuerySchema } from "@/schemas/promoCode";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = promoCodeQuerySchema.parse(params);
  const result = await promoCodeService.list(query);
  return success(result);
});
export const POST = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = createPromoCodeSchema.parse(body);
  const promoCode = await promoCodeService.create(input);
  return success({ promoCode }, 201);
});
