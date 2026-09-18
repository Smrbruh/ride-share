import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { vehicleTypeService } from "@/services/vehicleType.service";
import { updateVehicleTypeSchema } from "@/schemas/vehicleType";
export const GET = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid vehicle type id", 400, "BAD_REQUEST");
  const vehicleType = await vehicleTypeService.get(id);
  return success({ vehicleType });
});
export const PATCH = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid vehicle type id", 400, "BAD_REQUEST");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = updateVehicleTypeSchema.parse(body);
  const vehicleType = await vehicleTypeService.update(id, input);
  return success({ vehicleType });
});
export const DELETE = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid vehicle type id", 400, "BAD_REQUEST");
  await vehicleTypeService.remove(id);
  return success({ deleted: true });
});
