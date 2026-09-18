import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { paymentService } from "@/services/payment.service";
import { createPaymentSchema, paymentQuerySchema } from "@/schemas/payment";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = paymentQuerySchema.parse(params);
  const result = await paymentService.list(query);
  return success(result);
});
export const POST = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = createPaymentSchema.parse(body);
  const payment = await paymentService.create(input);
  return success({ payment }, 201);
});
