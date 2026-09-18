import { z } from "zod";
export const createPromoCodeSchema = z
  .object({
    code: z.string().min(3).max(30),
    discountPercent: z.number().positive().max(100),
    validFrom: z.coerce.date(),
    validTo: z.coerce.date(),
    maxUsage: z.number().int().positive()
  })
  .refine((data) => data.validTo > data.validFrom, { message: "validTo must be after validFrom", path: ["validTo"] });
export const updatePromoCodeSchema = z
  .object({
    code: z.string().min(3).max(30).optional(),
    discountPercent: z.number().positive().max(100).optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
    maxUsage: z.number().int().positive().optional()
  })
  .refine((data) => !data.validFrom || !data.validTo || data.validTo > data.validFrom, {
    message: "validTo must be after validFrom",
    path: ["validTo"]
  });
export const promoCodeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});
export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema>;
export type UpdatePromoCodeInput = z.infer<typeof updatePromoCodeSchema>;
export type PromoCodeQueryInput = z.infer<typeof promoCodeQuerySchema>;
