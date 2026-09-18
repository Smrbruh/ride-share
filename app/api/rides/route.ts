import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { rideSearchSchema, createRideSchema } from "@/schemas/ride";
import { getVehicleCapacity } from "@/lib/capacity";
import { ok, fail, success, failure } from "@/lib/api-response";
import { handleRoute } from "@/lib/route-handler";
import { requireAuth } from "@/lib/require-auth";
import { rideService } from "@/services/ride.service";
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = rideSearchSchema.safeParse(params);
  if (!parsed.success) return fail("Invalid query parameters", 422, parsed.error.flatten());
  const { city, date, minSeats } = parsed.data;
  const where: Record<string, unknown> = { status: "scheduled" };
  if (city) where.pickupLocation = { city: { equals: city, mode: "insensitive" } };
  if (date) {
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);
    where.startTime = { gte: dayStart, lt: dayEnd };
  }
  const rides = await prisma.ride.findMany({
    where,
    include: {
      driver: { select: { id: true, firstName: true, lastName: true } },
      pickupLocation: true,
      dropoffLocation: true,
      bookings: { where: { status: { in: ["pending", "confirmed"] } }, select: { seatCount: true } }
    },
    orderBy: { startTime: "asc" }
  });
  const enriched = await Promise.all(
    rides.map(async (ride) => {
      const vehicle = await prisma.vehicle.findFirst({
        where: { driverId: ride.driverId },
        include: { vehicleType: true }
      });
      const capacity = vehicle ? getVehicleCapacity(vehicle.vehicleType.typeName) : 4;
      const bookedSeats = ride.bookings.reduce((sum, booking) => sum + booking.seatCount, 0);
      const availableSeats = capacity - bookedSeats;
      return {
        id: ride.id,
        driver: ride.driver,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        startTime: ride.startTime,
        distanceKm: ride.distanceKm,
        fareAmount: ride.fareAmount,
        vehicle: vehicle
          ? { model: vehicle.model, color: vehicle.color, typeName: vehicle.vehicleType.typeName }
          : null,
        availableSeats
      };
    })
  );
  const filtered = minSeats ? enriched.filter((ride) => ride.availableSeats >= minSeats) : enriched;
  return ok({ rides: filtered });
}
export const POST = handleRoute(async (request: NextRequest) => {
  const auth = requireAuth(request, ["admin"]);
  if (!auth) return failure("Unauthorized", 401, "UNAUTHORIZED");
  const body = await request.json().catch(() => null);
  if (!body) return failure("Invalid JSON body", 400, "BAD_REQUEST");
  const input = createRideSchema.parse(body);
  const ride = await rideService.create(input);
  return success({ ride }, 201);
});
