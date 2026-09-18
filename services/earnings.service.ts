import { paymentRepository } from "@/repositories/payment.repository";
import { rideRepository } from "@/repositories/ride.repository";
import { ratingRepository } from "@/repositories/rating.repository";
function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}
function startOfWeek(date: Date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - diff);
  return result;
}
function startOfMonth(date: Date) {
  const result = startOfDay(date);
  result.setDate(1);
  return result;
}
export const earningsService = {
  async getDriverEarnings(driverId: number) {
    const now = new Date();
    const payments = await paymentRepository.findPaidForCompletedRidesByDriver(driverId);
    const dayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const sum = (predicate: (date: Date) => boolean) =>
      payments
        .filter((payment) => payment.paymentDate && predicate(payment.paymentDate))
        .reduce((total, payment) => total + Number(payment.amount), 0);
    const totalEarnings = payments.reduce((total, payment) => total + Number(payment.amount), 0);
    const dailyEarnings = sum((date) => date >= dayStart);
    const weeklyEarnings = sum((date) => date >= weekStart);
    const monthlyEarnings = sum((date) => date >= monthStart);
    const completedRidesCount = await rideRepository.countCompletedForDriver(driverId);
    const ratings = await ratingRepository.findForDriver(driverId);
    const averageRating =
      ratings.length > 0 ? ratings.reduce((total, rating) => total + rating.ratingValue, 0) / ratings.length : null;
    return { totalEarnings, dailyEarnings, weeklyEarnings, monthlyEarnings, completedRidesCount, averageRating };
  }
};
