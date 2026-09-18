import { z } from "zod";
import { PAYMENT_METHOD } from "@/types";
export const createPaymentSchema = z.object({
  bookingId: z.number().int().positive(),
  amount: z.number().positive(),
  paymentMethod: z.enum(PAYMENT_METHOD)
});
export const updatePaymentStatusSchema = z.object({
  status: z.enum(["pending", "paid", "failed", "refunded"])
});
export const paymentQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
