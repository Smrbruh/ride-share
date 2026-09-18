import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { vehicleService } from "@/services/vehicle.service";
import { updateVehicleSchema, selfUpdateVehicleSchema } from "@/schemas/vehicle";
import { AppError } from "@/lib/app-error";
export const GET = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin", "driver"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid vehicle id", 400, "BAD_REQUEST");
  const vehicle = await vehicleService.get(id);
  if (auth.role === "driver" && vehicle.driverId !== auth.id) throw AppError.forbidden();
  return success({ vehicle });
});
export const PATCH = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin", "driver"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid vehicle id", 400, "BAD_REQUEST");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  if (auth.role === "driver") {
    const current = await vehicleService.get(id);
    if (current.driverId !== auth.id) throw AppError.forbidden();
    const input = selfUpdateVehicleSchema.parse(body);
    const vehicle = await vehicleService.update(id, input);
    return success({ vehicle });
  }
  const input = updateVehicleSchema.parse(body);
  const vehicle = await vehicleService.update(id, input);
  return success({ vehicle });
});
export const DELETE = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid vehicle id", 400, "BAD_REQUEST");
  await vehicleService.remove(id);
  return success({ deleted: true });
});
