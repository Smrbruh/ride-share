import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { vehicleTypeService } from "@/services/vehicleType.service";
import { createVehicleTypeSchema } from "@/schemas/vehicleType";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const vehicleTypes = await vehicleTypeService.list();
  return success({ vehicleTypes });
});
export const POST = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = createVehicleTypeSchema.parse(body);
  const vehicleType = await vehicleTypeService.create(input);
  return success({ vehicleType }, 201);
});
