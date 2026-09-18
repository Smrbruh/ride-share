import { z } from "zod";
export const createVehicleSchema = z.object({
  driverId: z.number().int().positive(),
  vehicleTypeId: z.number().int().positive(),
  plateNumber: z.string().min(2).max(20),
  model: z.string().min(1).max(100),
  color: z.string().min(1).max(30),
  manufactureYear: z.number().int().min(1980).max(new Date().getFullYear() + 1)
});
export const updateVehicleSchema = createVehicleSchema.partial();
export const selfUpdateVehicleSchema = z.object({
  model: z.string().min(1).max(100).optional(),
  color: z.string().min(1).max(30).optional()
});
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type SelfUpdateVehicleInput = z.infer<typeof selfUpdateVehicleSchema>;
export const vehicleQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>;
