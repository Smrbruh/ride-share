import { z } from "zod";
export const createLocationSchema = z.object({
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});
export const updateLocationSchema = createLocationSchema.partial();
export const locationQuerySchema = z.object({
  city: z.string().optional(),
  address: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type LocationQueryInput = z.infer<typeof locationQuerySchema>;
