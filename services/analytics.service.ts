import { analyticsRepository } from "@/repositories/analytics.repository";
function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
export const analyticsService = {
  async getOverview() {
    const [users, drivers, activeRides, payments, revenue, ratings, vehicleGroups, vehicleTypes, paymentMethods] = await Promise.all([
      analyticsRepository.countUsers(),
      analyticsRepository.countDrivers(),
      analyticsRepository.countActiveRides(),
      analyticsRepository.countPayments(),
      analyticsRepository.sumPaidRevenue(),
      analyticsRepository.ratingStats(),
      analyticsRepository.vehicleDistribution(),
      analyticsRepository.vehicleTypes(),
      analyticsRepository.paymentMethodDistribution()
    ]);
    const typeNameById = new Map(vehicleTypes.map((type) => [type.id, type.typeName]));
    const vehicleDistribution = vehicleGroups.map((group) => ({
      typeName: typeNameById.get(group.vehicleTypeId) ?? "Unknown",
      count: group._count._all
    }));
    const paymentMethodDistribution = paymentMethods.map((group) => ({ method: group.paymentMethod, count: group._count._all }));
    return {
      totalUsers: users,
      totalDrivers: drivers,
      activeRides,
      totalPayments: payments,
      totalRevenue: Number(revenue._sum.amount ?? 0),
      totalRatings: ratings._count._all,
      averageRating: ratings._avg.ratingValue ?? null,
      vehicleDistribution,
      paymentMethodDistribution
    };
  },
  async getRevenue() {
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    const payments = await analyticsRepository.paidPaymentsSince(since);
    const buckets = new Map<string, number>();
    for (let i = 0; i < 12; i += 1) {
      const cursor = new Date(since);
      cursor.setMonth(cursor.getMonth() + i);
      buckets.set(monthKey(cursor), 0);
    }
    for (const payment of payments) {
      if (!payment.paymentDate) continue;
      const key = monthKey(payment.paymentDate);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(payment.amount));
    }
    return Array.from(buckets.entries()).map(([month, revenue]) => ({ month, revenue }));
  },
  async getRides() {
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const rides = await analyticsRepository.ridesSince(since);
    const buckets = new Map<string, number>();
    for (let i = 0; i < 14; i += 1) {
      const cursor = new Date(since);
      cursor.setDate(cursor.getDate() + i);
      buckets.set(dayKey(cursor), 0);
    }
    const statusCounts: Record<string, number> = { scheduled: 0, in_progress: 0, completed: 0, cancelled: 0 };
    for (const ride of rides) {
      const key = dayKey(ride.startTime);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      if (statusCounts[ride.status] !== undefined) statusCounts[ride.status] += 1;
    }
    const daily = Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
    return { daily, statusCounts };
  },
  async getDriverLeaderboard() {
    const [drivers, ratings] = await Promise.all([analyticsRepository.driverLeaderboard(), analyticsRepository.ratingsForDrivers()]);
    const ratingsByDriver = new Map<number, number[]>();
    for (const rating of ratings) {
      const driverId = rating.booking.ride.driverId;
      const list = ratingsByDriver.get(driverId) ?? [];
      list.push(rating.ratingValue);
      ratingsByDriver.set(driverId, list);
    }
    const leaderboard = drivers.map((driver) => {
      const completedRides = driver.rides.length;
      const totalEarnings = driver.rides.reduce((sum, ride) => sum + Number(ride.fareAmount), 0);
      const driverRatings = ratingsByDriver.get(driver.id) ?? [];
      const averageRating = driverRatings.length > 0 ? driverRatings.reduce((sum, value) => sum + value, 0) / driverRatings.length : null;
      return { id: driver.id, firstName: driver.firstName, lastName: driver.lastName, completedRides, totalEarnings, averageRating };
    });
    return leaderboard.sort((a, b) => b.completedRides - a.completedRides).slice(0, 10);
  }
};
