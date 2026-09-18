import { z } from "zod";
export const createRatingSchema = z.object({
  bookingId: z.number().int().positive(),
  ratingValue: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
});
export type CreateRatingInput = z.infer<typeof createRatingSchema>;
