import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/schemas/booking";
import { getVehicleCapacity } from "@/lib/capacity";
import { requireAuth } from "@/lib/require-auth";
import { ok, fail } from "@/lib/api-response";
export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ["user"]);
  if (!auth) return fail("Unauthorized", 401);
  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid JSON body", 400);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) return fail("Validation failed", 422, parsed.error.flatten());
  const { rideId, seatCount, promoCode, paymentMethod } = parsed.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const ride = await tx.ride.findUnique({ where: { id: rideId } });
      if (!ride) throw new BookingError("Ride not found", 404);
      if (ride.status !== "scheduled") throw new BookingError("Ride is not available for booking", 409);
      const vehicle = await tx.vehicle.findFirst({
        where: { driverId: ride.driverId },
        include: { vehicleType: true }
      });
      const capacity = vehicle ? getVehicleCapacity(vehicle.vehicleType.typeName) : 4;
      const existingBookings = await tx.booking.findMany({
        where: { rideId, status: { in: ["pending", "confirmed"] } },
        select: { seatCount: true }
      });
      const bookedSeats = existingBookings.reduce((sum, booking) => sum + booking.seatCount, 0);
      if (bookedSeats + seatCount > capacity) throw new BookingError("Not enough seats available", 409);
      const perSeatFare = Number(ride.fareAmount) / capacity;
      let amount = perSeatFare * seatCount;
      let appliedPromoId: number | null = null;
      if (promoCode) {
        const promo = await tx.promoCode.findUnique({ where: { code: promoCode } });
        if (!promo) throw new BookingError("Invalid promo code", 400);
        const now = new Date();
        if (now < promo.validFrom || now > promo.validTo) throw new BookingError("Promo code is expired", 400);
        const usageCount = await tx.userPromo.count({ where: { promoId: promo.id } });
        if (usageCount >= promo.maxUsage) throw new BookingError("Promo code usage limit reached", 409);
        const alreadyUsed = await tx.userPromo.findUnique({
          where: { userId_promoId: { userId: auth.id, promoId: promo.id } }
        });
        if (alreadyUsed) throw new BookingError("Promo code already used by this user", 409);
        amount = amount * (1 - Number(promo.discountPercent) / 100);
        appliedPromoId = promo.id;
      }
      const booking = await tx.booking.create({
        data: { rideId, userId: auth.id, seatCount, status: "confirmed" }
      });
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount,
          paymentMethod,
          paymentStatus: "pending"
        }
      });
      if (appliedPromoId) {
        await tx.userPromo.create({ data: { userId: auth.id, promoId: appliedPromoId } });
      }
      return { booking, payment };
    });
    return ok(result, 201);
  } catch (error) {
    if (error instanceof BookingError) return fail(error.message, error.status);
    return fail("Failed to create booking", 500);
  }
}
export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ["user"]);
  if (!auth) return fail("Unauthorized", 401);
  const bookings = await prisma.booking.findMany({
    where: { userId: auth.id },
    include: {
      ride: { include: { pickupLocation: true, dropoffLocation: true } },
      payment: true,
      rating: true
    },
    orderBy: { bookingTime: "desc" }
  });
  return ok({ bookings });
}
class BookingError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
