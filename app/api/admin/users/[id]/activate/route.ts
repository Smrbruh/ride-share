import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { userService } from "@/services/user.service";
export const PATCH = handleRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return failure("Invalid user id", 400, "BAD_REQUEST");
  const user = await userService.activate(id);
  return success({ user });
});
