import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { vehicleRepository } from "@/repositories/vehicle.repository";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["driver"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const vehicle = await vehicleRepository.findByDriverId(auth.id);
  if (!vehicle) return failure("No vehicle assigned yet", 404, "NOT_FOUND");
  return success({ vehicle });
});
