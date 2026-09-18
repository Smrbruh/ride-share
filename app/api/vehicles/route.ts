import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { vehicleService } from "@/services/vehicle.service";
import { createVehicleSchema, vehicleQuerySchema } from "@/schemas/vehicle";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = vehicleQuerySchema.parse(params);
  const result = await vehicleService.list(query);
  return success(result);
});
export const POST = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = createVehicleSchema.parse(body);
  const vehicle = await vehicleService.create(input);
  return success({ vehicle }, 201);
});
