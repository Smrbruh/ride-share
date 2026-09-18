import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { rideService } from "@/services/ride.service";
import { updateRideSchema } from "@/schemas/ride";
import { AppError } from "@/lib/app-error";
export const GET = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin", "driver"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid ride id", 400, "BAD_REQUEST");
  const ride = await rideService.get(id);
  if (auth.role === "driver" && ride.driverId !== auth.id) throw AppError.forbidden();
  return success({ ride });
});
export const PATCH = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid ride id", 400, "BAD_REQUEST");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = updateRideSchema.parse(body);
  const ride = await rideService.update(id, input);
  return success({ ride });
});
export const DELETE = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid ride id", 400, "BAD_REQUEST");
  await rideService.removeScheduled(id);
  return success({ deleted: true });
});
