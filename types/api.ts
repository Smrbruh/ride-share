export interface LocationDto {
  id: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}
export interface DriverSummaryDto {
  id: number;
  firstName: string;
  lastName: string;
}
export interface VehicleTypeDto {
  id: number;
  typeName: string;
  baseFare: number;
  perKmRate: number;
}
export interface VehicleDto {
  id: number;
  driverId: number;
  vehicleTypeId: number;
  plateNumber: string;
  model: string;
  color: string;
  manufactureYear: number;
  driver?: DriverFullDto;
  vehicleType?: VehicleTypeDto;
}
export interface DriverFullDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  hireDate: string;
  status: string;
  vehicle?: VehicleDto | null;
}
export interface RideSearchResultDto {
  id: number;
  driver: DriverSummaryDto;
  pickupLocation: LocationDto;
  dropoffLocation: LocationDto;
  startTime: string;
  distanceKm: number;
  fareAmount: number;
  vehicle: { model: string; color: string; typeName: string } | null;
  availableSeats: number;
}
export interface RideDto {
  id: number;
  driverId: number;
  pickupLocationId: number;
  dropoffLocationId: number;
  startTime: string;
  endTime: string | null;
  distanceKm: number;
  status: string;
  fareAmount: number;
  driver?: DriverFullDto;
  pickupLocation?: LocationDto;
  dropoffLocation?: LocationDto;
  bookings?: RideBookingPassengerDto[];
}
export interface RideBookingPassengerDto {
  id: number;
  seatCount: number;
  status: string;
  user: { id: number; firstName: string; lastName: string };
}
export interface PaymentDto {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string | null;
}
export interface RatingDto {
  id: number;
  bookingId: number;
  ratingValue: number;
  comment: string | null;
  ratingDate: string;
}
export interface BookingDto {
  id: number;
  rideId: number;
  userId: number;
  bookingTime: string;
  seatCount: number;
  status: string;
  ride: RideDto;
  payment: PaymentDto | null;
  rating: RatingDto | null;
}
export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}
export interface AuthResponseDto {
  token: string;
  user?: UserDto;
  driver?: DriverSummaryDto & { email: string };
  admin?: DriverSummaryDto & { email: string; role: string };
}
export interface DriverEarningsDto {
  totalEarnings: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedRidesCount: number;
  averageRating: number | null;
}
export interface AdminUserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  registrationDate: string;
  status: string;
}
export interface AdminDriverDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  hireDate: string;
  status: string;
  vehicle: VehicleDto | null;
}
export interface PromoCodeDto {
  id: number;
  code: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  maxUsage: number;
}
export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface AnalyticsOverviewDto {
  totalUsers: number;
  totalDrivers: number;
  activeRides: number;
  totalPayments: number;
  totalRevenue: number;
  totalRatings: number;
  averageRating: number | null;
  vehicleDistribution: { typeName: string; count: number }[];
  paymentMethodDistribution: { method: string; count: number }[];
}
export interface AnalyticsRevenueDto {
  month: string;
  revenue: number;
}
export interface AnalyticsRidesDto {
  daily: { date: string; count: number }[];
  statusCounts: Record<string, number>;
}
export interface AnalyticsDriverLeaderboardDto {
  id: number;
  firstName: string;
  lastName: string;
  completedRides: number;
  totalEarnings: number;
  averageRating: number | null;
}
export interface AdminRideDto {
  id: number;
  driverId: number;
  pickupLocationId: number;
  dropoffLocationId: number;
  startTime: string;
  endTime: string | null;
  distanceKm: number;
  status: string;
  fareAmount: number;
  driver: { firstName: string; lastName: string; vehicle: { plateNumber: string; model: string; vehicleType: VehicleTypeDto } | null };
  pickupLocation: LocationDto;
  dropoffLocation: LocationDto;
}
