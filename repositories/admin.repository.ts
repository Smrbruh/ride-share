import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const adminRepository = {
  findByEmail(email: string, db: DbClient = prisma) {
    return db.admin.findUnique({ where: { email } });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.admin.findUnique({ where: { id } });
  },
  create(data: Prisma.AdminCreateInput, db: DbClient = prisma) {
    return db.admin.create({ data });
  }
};
