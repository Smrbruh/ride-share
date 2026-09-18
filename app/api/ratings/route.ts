import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRatingSchema } from "@/schemas/rating";
import { requireAuth } from "@/lib/require-auth";
import { ok, fail, success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { paginationSchema, paginationSkipTake } from "@/lib/pagination";
export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ["user"]);
  if (!auth) return fail("Unauthorized", 401);
  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid JSON body", 400);
  const parsed = createRatingSchema.safeParse(body);
  if (!parsed.success) return fail("Validation failed", 422, parsed.error.flatten());
  const { bookingId, ratingValue, comment } = parsed.data;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { ride: true, rating: true }
  });
  if (!booking) return fail("Booking not found", 404);
  if (booking.userId !== auth.id) return fail("Forbidden", 403);
  if (booking.ride.status !== "completed") return fail("Ride must be completed before rating", 409);
  if (booking.rating) return fail("This booking has already been rated", 409);
  const rating = await prisma.rating.create({
    data: { bookingId, ratingValue, comment }
  });
  return ok({ rating }, 201);
}
export const GET = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const query = paginationSchema.parse(params);
  const { skip, take } = paginationSkipTake(query.page, query.pageSize);
  const [items, total] = await Promise.all([
    prisma.rating.findMany({
      skip,
      take,
      orderBy: { id: "desc" },
      include: { booking: { include: { user: true, ride: { include: { driver: true } } } } }
    }),
    prisma.rating.count()
  ]);
  return success({ items, total, page: query.page, pageSize: query.pageSize });
});
