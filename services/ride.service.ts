import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { rideRepository } from "@/repositories/ride.repository";
import { driverRepository } from "@/repositories/driver.repository";
import { locationRepository } from "@/repositories/location.repository";
import { vehicleRepository } from "@/repositories/vehicle.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { paymentRepository } from "@/repositories/payment.repository";
import { computeFare } from "@/lib/fare";
import { AppError } from "@/lib/app-error";
import { paginationSkipTake } from "@/lib/pagination";
import type { CreateRideInput, UpdateRideInput, AdminRideQueryInput } from "@/schemas/ride";
export const rideService = {
  async list(filters: { driverId?: number; status?: string }) {
    return rideRepository.findMany({ driverId: filters.driverId, status: filters.status });
  },
  async adminList(query: AdminRideQueryInput) {
    const where: Prisma.RideWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.date) {
      const dayStart = new Date(query.date);
      const dayEnd = new Date(query.date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.startTime = { gte: dayStart, lt: dayEnd };
    }
    if (query.search) {
      where.OR = [
        { pickupLocation: { address: { contains: query.search, mode: "insensitive" } } },
        { dropoffLocation: { address: { contains: query.search, mode: "insensitive" } } },
        { driver: { firstName: { contains: query.search, mode: "insensitive" } } },
        { driver: { lastName: { contains: query.search, mode: "insensitive" } } }
      ];
    }
    const { skip, take } = paginationSkipTake(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      rideRepository.findMany(where, prisma, skip, take),
      rideRepository.count(where)
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },
  async get(id: number) {
    const ride = await rideRepository.findById(id);
    if (!ride) throw AppError.notFound("Ride not found");
    return ride;
  },
  async create(input: CreateRideInput) {
    if (input.pickupLocationId === input.dropoffLocationId) {
      throw AppError.validation("Pickup and dropoff locations must be different");
    }
    if (input.startTime.getTime() <= Date.now()) {
      throw AppError.validation("Departure time must be in the future");
    }
    const driver = await driverRepository.findById(input.driverId);
    if (!driver) throw AppError.notFound("Driver not found");
    const vehicle = await vehicleRepository.findByDriverId(input.driverId);
    if (!vehicle) throw AppError.conflict("Driver has no assigned vehicle");
    const pickup = await locationRepository.findById(input.pickupLocationId);
    if (!pickup) throw AppError.notFound("Pickup location not found");
    const dropoff = await locationRepository.findById(input.dropoffLocationId);
    if (!dropoff) throw AppError.notFound("Dropoff location not found");
    const fareAmount = computeFare(vehicle.vehicleType.baseFare, vehicle.vehicleType.perKmRate, input.distanceKm);
    return rideRepository.create({
      driverId: input.driverId,
      pickupLocationId: input.pickupLocationId,
      dropoffLocationId: input.dropoffLocationId,
      startTime: input.startTime,
      distanceKm: input.distanceKm,
      status: "scheduled",
      fareAmount
    });
  },
  async update(id: number, input: UpdateRideInput) {
    const current = await rideRepository.findById(id);
    if (!current) throw AppError.notFound("Ride not found");
    if (current.status !== "scheduled") throw AppError.conflict("Only scheduled rides can be updated");
    if (input.pickupLocationId) {
      const pickup = await locationRepository.findById(input.pickupLocationId);
      if (!pickup) throw AppError.notFound("Pickup location not found");
    }
    if (input.dropoffLocationId) {
      const dropoff = await locationRepository.findById(input.dropoffLocationId);
      if (!dropoff) throw AppError.notFound("Dropoff location not found");
    }
    let fareAmount: number | undefined;
    if (input.distanceKm) {
      const vehicle = await vehicleRepository.findByDriverId(current.driverId);
      if (!vehicle) throw AppError.conflict("Driver has no assigned vehicle");
      fareAmount = computeFare(vehicle.vehicleType.baseFare, vehicle.vehicleType.perKmRate, input.distanceKm);
    }
    return rideRepository.update(id, { ...input, ...(fareAmount !== undefined ? { fareAmount } : {}) });
  },
  async removeScheduled(id: number) {
    const current = await rideRepository.findById(id);
    if (!current) throw AppError.notFound("Ride not found");
    if (current.status !== "scheduled") throw AppError.conflict("Only scheduled rides can be deleted");
    const activeBookings = await rideRepository.countActiveBookings(id);
    if (activeBookings > 0) throw AppError.conflict("Ride has active bookings and cannot be deleted");
    return rideRepository.delete(id);
  },
  async start(driverId: number, rideId: number) {
    const ride = await rideRepository.findById(rideId);
    if (!ride) throw AppError.notFound("Ride not found");
    if (ride.driverId !== driverId) throw AppError.forbidden("Only the assigned driver can start this ride");
    if (ride.status !== "scheduled") throw AppError.conflict("Only a scheduled ride can be started");
    return rideRepository.update(rideId, { status: "in_progress", startTime: new Date() });
  },
  async finish(driverId: number, rideId: number) {
    return prisma.$transaction(async (tx) => {
      const ride = await rideRepository.findById(rideId, tx);
      if (!ride) throw AppError.notFound("Ride not found");
      if (ride.driverId !== driverId) throw AppError.forbidden("Only the assigned driver can finish this ride");
      if (ride.status !== "in_progress") throw AppError.conflict("A ride must be in progress before it can be finished");
      const updatedRide = await rideRepository.update(rideId, { status: "completed", endTime: new Date() }, tx);
      await bookingRepository.updateStatusMany(rideId, ["confirmed", "pending"], "completed", tx);
      return updatedRide;
    });
  },
  async cancel(rideId: number) {
    return prisma.$transaction(async (tx) => {
      const ride = await rideRepository.findById(rideId, tx);
      if (!ride) throw AppError.notFound("Ride not found");
      if (ride.status === "completed" || ride.status === "cancelled") {
        throw AppError.conflict("Completed or already cancelled rides cannot be cancelled");
      }
      const updatedRide = await rideRepository.update(rideId, { status: "cancelled" }, tx);
      const bookings = await bookingRepository.findByRideId(rideId, tx);
      await bookingRepository.updateStatusMany(rideId, ["pending", "confirmed"], "cancelled", tx);
      const bookingIds = bookings.map((booking) => booking.id);
      if (bookingIds.length > 0) {
        await paymentRepository.updateMany({ bookingId: { in: bookingIds }, paymentStatus: "paid" }, { paymentStatus: "refunded" }, tx);
      }
      return updatedRide;
    });
  },
  async driverHistory(driverId: number, status?: string) {
    return rideRepository.findMany({ driverId, status });
  }
};
