import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const driverRepository = {
  findMany(where: Prisma.DriverWhereInput, skip: number, take: number, db: DbClient = prisma) {
    return db.driver.findMany({ where, skip, take, orderBy: { id: "asc" }, include: { vehicle: true } });
  },
  count(where: Prisma.DriverWhereInput, db: DbClient = prisma) {
    return db.driver.count({ where });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.driver.findUnique({ where: { id }, include: { vehicle: true } });
  },
  findByEmail(email: string, db: DbClient = prisma) {
    return db.driver.findUnique({ where: { email } });
  },
  findByPhoneOrLicense(phoneNumber: string, licenseNumber: string, db: DbClient = prisma) {
    return db.driver.findFirst({ where: { OR: [{ phoneNumber }, { licenseNumber }] } });
  },
  create(data: Prisma.DriverCreateInput, db: DbClient = prisma) {
    return db.driver.create({ data });
  },
  update(id: number, data: Prisma.DriverUpdateInput, db: DbClient = prisma) {
    return db.driver.update({ where: { id }, data });
  },
  delete(id: number, db: DbClient = prisma) {
    return db.driver.delete({ where: { id } });
  },
  countActiveRides(id: number, db: DbClient = prisma) {
    return db.ride.count({ where: { driverId: id, status: { in: ["scheduled", "in_progress"] } } });
  }
};
