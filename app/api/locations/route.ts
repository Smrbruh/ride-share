import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { locationService } from "@/services/location.service";
import { createLocationSchema, locationQuerySchema } from "@/schemas/location";
export const GET = handleRoute(async (request: NextRequest) => {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = locationQuerySchema.parse(params);
  const result = await locationService.list(query);
  return success(result);
});
export const POST = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = createLocationSchema.parse(body);
  const location = await locationService.create(input);
  return success({ location }, 201);
});
