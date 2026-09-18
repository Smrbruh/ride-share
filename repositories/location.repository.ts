import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const locationRepository = {
  findMany(where: Prisma.LocationWhereInput, skip: number, take: number, db: DbClient = prisma) {
    return db.location.findMany({ where, skip, take, orderBy: { id: "asc" } });
  },
  count(where: Prisma.LocationWhereInput, db: DbClient = prisma) {
    return db.location.count({ where });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.location.findUnique({ where: { id } });
  },
  create(data: Prisma.LocationCreateInput, db: DbClient = prisma) {
    return db.location.create({ data });
  },
  update(id: number, data: Prisma.LocationUpdateInput, db: DbClient = prisma) {
    return db.location.update({ where: { id }, data });
  },
  delete(id: number, db: DbClient = prisma) {
    return db.location.delete({ where: { id } });
  }
};
