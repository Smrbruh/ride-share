export type AuthRole = "user" | "driver" | "admin";
export interface JwtPayload {
  id: number;
  role: AuthRole;
  email: string;
}
export const RIDE_STATUS = ["scheduled", "in_progress", "completed", "cancelled"] as const;
export type RideStatus = (typeof RIDE_STATUS)[number];
export const BOOKING_STATUS = ["pending", "confirmed", "cancelled", "completed"] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];
export const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
export interface ApiError {
  error: string;
  details?: unknown;
}
export const PAYMENT_METHOD = ["card", "cash", "qr"] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[number];
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
