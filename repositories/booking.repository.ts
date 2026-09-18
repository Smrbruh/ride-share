import { prisma, type DbClient } from "@/lib/prisma";
export const bookingRepository = {
  findById(id: number, db: DbClient = prisma) {
    return db.booking.findUnique({ where: { id }, include: { ride: true, payment: true } });
  },
  findByRideId(rideId: number, db: DbClient = prisma) {
    return db.booking.findMany({ where: { rideId } });
  },
  updateStatusMany(rideId: number, fromStatuses: string[], toStatus: string, db: DbClient = prisma) {
    return db.booking.updateMany({ where: { rideId, status: { in: fromStatuses } }, data: { status: toStatus } });
  }
};
