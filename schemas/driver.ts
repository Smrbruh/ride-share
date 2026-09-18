import { z } from "zod";
export const createDriverSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(150),
  phoneNumber: z.string().min(5).max(30),
  licenseNumber: z.string().min(3).max(50),
  licenseExpiryDate: z.coerce.date(),
  hireDate: z.coerce.date(),
  password: z.string().min(8).max(72),
  status: z.enum(["active", "suspended"]).optional()
});
export const updateDriverSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().min(5).max(30).optional(),
  licenseNumber: z.string().min(3).max(50).optional(),
  licenseExpiryDate: z.coerce.date().optional()
});
export const driverQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type DriverQueryInput = z.infer<typeof driverQuerySchema>;
