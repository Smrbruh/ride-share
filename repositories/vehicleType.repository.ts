import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const vehicleTypeRepository = {
  findMany(db: DbClient = prisma) {
    return db.vehicleType.findMany({ orderBy: { id: "asc" } });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.vehicleType.findUnique({ where: { id } });
  },
  findByName(typeName: string, db: DbClient = prisma) {
    return db.vehicleType.findUnique({ where: { typeName } });
  },
  create(data: Prisma.VehicleTypeCreateInput, db: DbClient = prisma) {
    return db.vehicleType.create({ data });
  },
  update(id: number, data: Prisma.VehicleTypeUpdateInput, db: DbClient = prisma) {
    return db.vehicleType.update({ where: { id }, data });
  },
  delete(id: number, db: DbClient = prisma) {
    return db.vehicleType.delete({ where: { id } });
  },
  countVehiclesUsingType(id: number, db: DbClient = prisma) {
    return db.vehicle.count({ where: { vehicleTypeId: id } });
  }
};
