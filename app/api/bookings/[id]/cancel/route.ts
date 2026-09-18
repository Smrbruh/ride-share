import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { ok, fail } from "@/lib/api-response";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request, ["user"]);
  if (!auth) return fail("Unauthorized", 401);
  const { id: idParam } = await params;
  const bookingId = Number(idParam);
  if (!Number.isInteger(bookingId)) return fail("Invalid booking id", 400);
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { ride: true } });
  if (!booking) return fail("Booking not found", 404);
  if (booking.userId !== auth.id) return fail("Forbidden", 403);
  if (booking.status === "cancelled") return fail("Booking is already cancelled", 409);
  if (booking.ride.status === "in_progress" || booking.ride.status === "completed") {
    return fail("Cannot cancel a booking for a ride already in progress or completed", 409);
  }
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" }
  });
  await prisma.payment.updateMany({
    where: { bookingId, paymentStatus: "paid" },
    data: { paymentStatus: "refunded" }
  });
  return ok({ booking: updated });
}
