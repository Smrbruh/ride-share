import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { rideService } from "@/services/ride.service";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["driver"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const rides = await rideService.driverHistory(auth.id, status);
  return success({ rides });
});
