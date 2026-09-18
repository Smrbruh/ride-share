import { z } from "zod";
export const createBookingSchema = z.object({
  rideId: z.number().int().positive(),
  seatCount: z.number().int().positive().max(8),
  promoCode: z.string().min(1).max(30).optional(),
  paymentMethod: z.enum(["card", "cash", "wallet"])
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
