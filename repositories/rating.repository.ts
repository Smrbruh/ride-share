import { prisma, type DbClient } from "@/lib/prisma";
export const ratingRepository = {
  findForDriver(driverId: number, db: DbClient = prisma) {
    return db.rating.findMany({ where: { booking: { ride: { driverId } } }, select: { ratingValue: true } });
  }
};
