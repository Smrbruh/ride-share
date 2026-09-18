import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { paymentService } from "@/services/payment.service";
import { updatePaymentStatusSchema } from "@/schemas/payment";
export const GET = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin", "user"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid payment id", 400, "BAD_REQUEST");
  const payment = await paymentService.get(id, auth);
  return success({ payment });
});
export const PATCH = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid payment id", 400, "BAD_REQUEST");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = updatePaymentStatusSchema.parse(body);
  const payment = await paymentService.updateStatus(id, input.status);
  return success({ payment });
});
