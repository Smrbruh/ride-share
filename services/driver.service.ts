import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { driverRepository } from "@/repositories/driver.repository";
import { vehicleRepository } from "@/repositories/vehicle.repository";
import { hashPassword } from "@/lib/auth";
import { AppError } from "@/lib/app-error";
import { paginationSkipTake } from "@/lib/pagination";
import type { CreateDriverInput, UpdateDriverInput, DriverQueryInput } from "@/schemas/driver";
export const driverService = {
  async list(query: DriverQueryInput) {
    const where: Prisma.DriverWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { phoneNumber: { contains: query.search, mode: "insensitive" } },
        { licenseNumber: { contains: query.search, mode: "insensitive" } }
      ];
    }
    const { skip, take } = paginationSkipTake(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      driverRepository.findMany(where, skip, take),
      driverRepository.count(where)
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },
  async get(id: number) {
    const driver = await driverRepository.findById(id);
    if (!driver) throw AppError.notFound("Driver not found");
    return driver;
  },
  async create(input: CreateDriverInput) {
    if (input.licenseExpiryDate.getTime() <= Date.now()) throw AppError.validation("License expiry date must be in the future");
    const existingEmail = await driverRepository.findByEmail(input.email);
    if (existingEmail) throw AppError.conflict("Email already in use");
    const existingPhoneOrLicense = await driverRepository.findByPhoneOrLicense(input.phoneNumber, input.licenseNumber);
    if (existingPhoneOrLicense) throw AppError.conflict("Phone number or license number already in use");
    const passwordHash = await hashPassword(input.password);
    return driverRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      licenseNumber: input.licenseNumber,
      licenseExpiryDate: input.licenseExpiryDate,
      hireDate: input.hireDate,
      passwordHash,
      status: input.status ?? "active"
    });
  },
  async update(id: number, input: UpdateDriverInput) {
    const current = await driverRepository.findById(id);
    if (!current) throw AppError.notFound("Driver not found");
    if (input.licenseExpiryDate && input.licenseExpiryDate.getTime() <= Date.now()) {
      throw AppError.validation("License expiry date must be in the future");
    }
    return driverRepository.update(id, input);
  },
  async activate(id: number) {
    const current = await driverRepository.findById(id);
    if (!current) throw AppError.notFound("Driver not found");
    return driverRepository.update(id, { status: "active" });
  },
  async suspend(id: number) {
    const current = await driverRepository.findById(id);
    if (!current) throw AppError.notFound("Driver not found");
    return driverRepository.update(id, { status: "suspended" });
  },
  async removeInactive(id: number) {
    return prisma.$transaction(async (tx) => {
      const current = await driverRepository.findById(id, tx);
      if (!current) throw AppError.notFound("Driver not found");
      if (current.status === "active") throw AppError.conflict("Suspend the driver before deleting");
      const activeRides = await driverRepository.countActiveRides(id, tx);
      if (activeRides > 0) throw AppError.conflict("Cannot delete a driver with scheduled or in-progress rides");
      const vehicle = await vehicleRepository.findByDriverId(id, tx);
      if (vehicle) await vehicleRepository.delete(vehicle.id, tx);
      try {
        return await driverRepository.delete(id, tx);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          throw AppError.conflict("Cannot delete a driver with existing ride history; keep them suspended instead");
        }
        throw error;
      }
    });
  }
};
