import { prisma } from "@/lib/prisma";
export const analyticsRepository = {
  countUsers() {
    return prisma.user.count({ where: { status: { not: "deleted" } } });
  },
  countDrivers() {
    return prisma.driver.count();
  },
  countActiveRides() {
    return prisma.ride.count({ where: { status: { in: ["scheduled", "in_progress"] } } });
  },
  countPayments() {
    return prisma.payment.count();
  },
  sumPaidRevenue() {
    return prisma.payment.aggregate({ where: { paymentStatus: "paid" }, _sum: { amount: true } });
  },
  ratingStats() {
    return prisma.rating.aggregate({ _count: { _all: true }, _avg: { ratingValue: true } });
  },
  paidPaymentsSince(since: Date) {
    return prisma.payment.findMany({
      where: { paymentStatus: "paid", paymentDate: { gte: since } },
      select: { amount: true, paymentDate: true }
    });
  },
  ridesSince(since: Date) {
    return prisma.ride.findMany({ where: { startTime: { gte: since } }, select: { startTime: true, status: true } });
  },
  vehicleDistribution() {
    return prisma.vehicle.groupBy({ by: ["vehicleTypeId"], _count: { _all: true } });
  },
  vehicleTypes() {
    return prisma.vehicleType.findMany({ select: { id: true, typeName: true } });
  },
  paymentMethodDistribution() {
    return prisma.payment.groupBy({ by: ["paymentMethod"], _count: { _all: true } });
  },
  driverLeaderboard() {
    return prisma.driver.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rides: { where: { status: "completed" }, select: { id: true, fareAmount: true } }
      }
    });
  },
  ratingsForDrivers() {
    return prisma.rating.findMany({ select: { ratingValue: true, booking: { select: { ride: { select: { driverId: true } } } } } });
  }
};
