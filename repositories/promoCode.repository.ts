import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const promoCodeRepository = {
  findMany(where: Prisma.PromoCodeWhereInput, skip: number, take: number, db: DbClient = prisma) {
    return db.promoCode.findMany({ where, skip, take, orderBy: { id: "asc" } });
  },
  count(where: Prisma.PromoCodeWhereInput, db: DbClient = prisma) {
    return db.promoCode.count({ where });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.promoCode.findUnique({ where: { id } });
  },
  findByCode(code: string, db: DbClient = prisma) {
    return db.promoCode.findUnique({ where: { code } });
  },
  create(data: Prisma.PromoCodeCreateInput, db: DbClient = prisma) {
    return db.promoCode.create({ data });
  },
  update(id: number, data: Prisma.PromoCodeUpdateInput, db: DbClient = prisma) {
    return db.promoCode.update({ where: { id }, data });
  },
  delete(id: number, db: DbClient = prisma) {
    return db.promoCode.delete({ where: { id } });
  },
  countUsage(id: number, db: DbClient = prisma) {
    return db.userPromo.count({ where: { promoId: id } });
  }
};
