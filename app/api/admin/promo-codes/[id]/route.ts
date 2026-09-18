import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { promoCodeService } from "@/services/promoCode.service";
import { updatePromoCodeSchema } from "@/schemas/promoCode";
export const GET = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid promo code id", 400, "BAD_REQUEST");
  const promoCode = await promoCodeService.get(id);
  return success({ promoCode });
});
export const PATCH = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid promo code id", 400, "BAD_REQUEST");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = updatePromoCodeSchema.parse(body);
  const promoCode = await promoCodeService.update(id, input);
  return success({ promoCode });
});
export const DELETE = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid promo code id", 400, "BAD_REQUEST");
  await promoCodeService.remove(id);
  return success({ deleted: true });
});
