import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const userRepository = {
  findMany(where: Prisma.UserWhereInput, skip: number, take: number, db: DbClient = prisma) {
    return db.user.findMany({ where, skip, take, orderBy: { id: "asc" } });
  },
  count(where: Prisma.UserWhereInput, db: DbClient = prisma) {
    return db.user.count({ where });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.user.findUnique({ where: { id } });
  },
  findByEmailOrPhone(email: string, phoneNumber: string, db: DbClient = prisma) {
    return db.user.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
  },
  update(id: number, data: Prisma.UserUpdateInput, db: DbClient = prisma) {
    return db.user.update({ where: { id }, data });
  }
};
