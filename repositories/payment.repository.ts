import { prisma, type DbClient } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const paymentRepository = {
  findMany(where: Prisma.PaymentWhereInput, skip: number, take: number, db: DbClient = prisma) {
    return db.payment.findMany({
      where,
      skip,
      take,
      orderBy: { id: "desc" },
      include: { booking: { include: { user: true, ride: { include: { driver: true } } } } }
    });
  },
  count(where: Prisma.PaymentWhereInput, db: DbClient = prisma) {
    return db.payment.count({ where });
  },
  findById(id: number, db: DbClient = prisma) {
    return db.payment.findUnique({
      where: { id },
      include: { booking: { include: { user: true, ride: { include: { driver: true } } } } }
    });
  },
  findByBookingId(bookingId: number, db: DbClient = prisma) {
    return db.payment.findUnique({ where: { bookingId } });
  },
  create(data: Prisma.PaymentUncheckedCreateInput, db: DbClient = prisma) {
    return db.payment.create({ data });
  },
  update(id: number, data: Prisma.PaymentUncheckedUpdateInput, db: DbClient = prisma) {
    return db.payment.update({ where: { id }, data });
  },
  updateMany(where: Prisma.PaymentWhereInput, data: Prisma.PaymentUncheckedUpdateManyInput, db: DbClient = prisma) {
    return db.payment.updateMany({ where, data });
  },
  findPaidForCompletedRidesByDriver(driverId: number, db: DbClient = prisma) {
    return db.payment.findMany({
      where: { paymentStatus: "paid", booking: { ride: { driverId, status: "completed" } } },
      select: { amount: true, paymentDate: true, bookingId: true }
    });
  }
};
