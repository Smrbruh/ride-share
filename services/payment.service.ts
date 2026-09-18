import { Prisma } from "@prisma/client";
import { paymentRepository } from "@/repositories/payment.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { AppError } from "@/lib/app-error";
import { paginationSkipTake } from "@/lib/pagination";
import type { CreatePaymentInput, PaymentQueryInput } from "@/schemas/payment";
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "failed"],
  paid: ["refunded"],
  failed: ["pending"],
  refunded: []
};
export const paymentService = {
  async list(query: PaymentQueryInput) {
    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.paymentStatus = query.status;
    const { skip, take } = paginationSkipTake(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      paymentRepository.findMany(where, skip, take),
      paymentRepository.count(where)
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },
  async get(id: number, requester: { id: number; role: string }) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw AppError.notFound("Payment not found");
    if (requester.role === "user" && payment.booking.userId !== requester.id) throw AppError.forbidden();
    return payment;
  },
  async create(input: CreatePaymentInput) {
    const booking = await bookingRepository.findById(input.bookingId);
    if (!booking) throw AppError.notFound("Booking not found");
    const existing = await paymentRepository.findByBookingId(input.bookingId);
    if (existing) throw AppError.conflict("This booking already has a payment");
    return paymentRepository.create({
      bookingId: input.bookingId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending"
    });
  },
  async updateStatus(id: number, nextStatus: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw AppError.notFound("Payment not found");
    const allowed = ALLOWED_TRANSITIONS[payment.paymentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw AppError.conflict(`Cannot change payment status from ${payment.paymentStatus} to ${nextStatus}`);
    }
    return paymentRepository.update(id, {
      paymentStatus: nextStatus,
      paymentDate: nextStatus === "paid" ? new Date() : payment.paymentDate
    });
  },
  async refund(id: number) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw AppError.notFound("Payment not found");
    if (payment.paymentStatus !== "paid") throw AppError.conflict("Only paid payments can be refunded");
    return paymentRepository.update(id, { paymentStatus: "refunded" });
  }
};
