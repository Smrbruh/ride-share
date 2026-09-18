import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { driverService } from "@/services/driver.service";
import { createDriverSchema, driverQuerySchema } from "@/schemas/driver";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = driverQuerySchema.parse(params);
  const result = await driverService.list(query);
  return success(result);
});
export const POST = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = createDriverSchema.parse(body);
  const driver = await driverService.create(input);
  return success({ driver }, 201);
});
