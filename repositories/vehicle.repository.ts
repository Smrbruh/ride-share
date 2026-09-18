import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const vehicleRepository = {
  findMany(where?: Prisma.VehicleWhereInput, skip?: number, take?: number, db: DbClient = prisma) {
    return db.vehicle.findMany({ where, skip, take, orderBy: { id: "asc" }, include: { driver: true, vehicleType: true } });
  },
  count(where: Prisma.VehicleWhereInput, db: DbClient = prisma) {
    return db.vehicle.count({ where });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.vehicle.findUnique({ where: { id }, include: { driver: true, vehicleType: true } });
  },
  findByDriverId(driverId: number, db: DbClient = prisma) {
    return db.vehicle.findUnique({ where: { driverId }, include: { vehicleType: true } });
  },
  findByPlateNumber(plateNumber: string, db: DbClient = prisma) {
    return db.vehicle.findUnique({ where: { plateNumber } });
  },
  create(data: Prisma.VehicleUncheckedCreateInput, db: DbClient = prisma) {
    return db.vehicle.create({ data });
  },
  update(id: number, data: Prisma.VehicleUncheckedUpdateInput, db: DbClient = prisma) {
    return db.vehicle.update({ where: { id }, data });
  },
  delete(id: number, db: DbClient = prisma) {
    return db.vehicle.delete({ where: { id } });
  }
};
