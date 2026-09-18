import { z } from "zod";
export const createVehicleTypeSchema = z.object({
  typeName: z.string().min(1).max(50),
  baseFare: z.number().positive().max(1000000),
  perKmRate: z.number().positive().max(100000)
});
export const updateVehicleTypeSchema = createVehicleTypeSchema.partial();
export type CreateVehicleTypeInput = z.infer<typeof createVehicleTypeSchema>;
export type UpdateVehicleTypeInput = z.infer<typeof updateVehicleTypeSchema>;
