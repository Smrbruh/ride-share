import { z } from "zod";
export const rideSearchSchema = z.object({
  city: z.string().optional(),
  date: z.string().optional(),
  minSeats: z.coerce.number().int().positive().optional()
});
export type RideSearchInput = z.infer<typeof rideSearchSchema>;
export const createRideSchema = z.object({
  driverId: z.number().int().positive(),
  pickupLocationId: z.number().int().positive(),
  dropoffLocationId: z.number().int().positive(),
  startTime: z.coerce.date(),
  distanceKm: z.number().positive().max(2000)
});
export const updateRideSchema = z.object({
  pickupLocationId: z.number().int().positive().optional(),
  dropoffLocationId: z.number().int().positive().optional(),
  startTime: z.coerce.date().optional(),
  distanceKm: z.number().positive().max(2000).optional()
});
export type CreateRideInput = z.infer<typeof createRideSchema>;
export type UpdateRideInput = z.infer<typeof updateRideSchema>;
export const adminRideQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});
export type AdminRideQueryInput = z.infer<typeof adminRideQuerySchema>;
