import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { earningsService } from "@/services/earnings.service";
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["driver"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const earnings = await earningsService.getDriverEarnings(auth.id);
  return success({ earnings });
});
