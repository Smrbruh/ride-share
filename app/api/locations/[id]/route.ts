import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { locationService } from "@/services/location.service";
import { updateLocationSchema } from "@/schemas/location";
export const GET = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid location id", 400, "BAD_REQUEST");
  const location = await locationService.get(id);
  return success({ location });
});
export const PATCH = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid location id", 400, "BAD_REQUEST");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = updateLocationSchema.parse(body);
  const location = await locationService.update(id, input);
  return success({ location });
});
export const DELETE = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid location id", 400, "BAD_REQUEST");
  await locationService.remove(id);
  return success({ deleted: true });
});
