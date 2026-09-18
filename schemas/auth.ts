import { z } from "zod";
export const registerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(150),
  phoneNumber: z.string().min(5).max(30),
  password: z.string().min(8).max(72)
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
