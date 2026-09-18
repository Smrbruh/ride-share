import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const rideRepository = {
  findMany(where: Prisma.RideWhereInput | undefined, db: DbClient = prisma, skip?: number, take?: number) {
    return db.ride.findMany({
      where,
      skip,
      take,
      include: { driver: { include: { vehicle: { include: { vehicleType: true } } } }, pickupLocation: true, dropoffLocation: true },
      orderBy: { startTime: "desc" }
    });
  },
  count(where: Prisma.RideWhereInput | undefined, db: DbClient = prisma) {
    return db.ride.count({ where });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.ride.findUnique({
      where: { id },
      include: {
        driver: true,
        pickupLocation: true,
        dropoffLocation: true,
        bookings: { include: { user: { select: { id: true, firstName: true, lastName: true } } } }
      }
    });
  },
  create(data: Prisma.RideUncheckedCreateInput, db: DbClient = prisma) {
    return db.ride.create({ data });
  },
  update(id: number, data: Prisma.RideUncheckedUpdateInput, db: DbClient = prisma) {
    return db.ride.update({ where: { id }, data });
  },
  delete(id: number, db: DbClient = prisma) {
    return db.ride.delete({ where: { id } });
  },
  countActiveBookings(rideId: number, db: DbClient = prisma) {
    return db.booking.count({ where: { rideId, status: { in: ["pending", "confirmed"] } } });
  },
  countCompletedForDriver(driverId: number, db: DbClient = prisma) {
    return db.ride.count({ where: { driverId, status: "completed" } });
  }
};
