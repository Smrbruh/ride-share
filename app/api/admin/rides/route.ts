import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { rideService } from "@/services/ride.service";
import { adminRideQuerySchema } from "@/schemas/ride";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = adminRideQuerySchema.parse(params);
  const result = await rideService.adminList(query);
  return success(result);
});
