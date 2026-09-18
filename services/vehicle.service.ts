import { prisma } from "@/lib/prisma";
import { vehicleRepository } from "@/repositories/vehicle.repository";
import { driverRepository } from "@/repositories/driver.repository";
import { vehicleTypeRepository } from "@/repositories/vehicleType.repository";
import { AppError } from "@/lib/app-error";
import { paginationSkipTake } from "@/lib/pagination";
import type { CreateVehicleInput, UpdateVehicleInput, VehicleQueryInput } from "@/schemas/vehicle";
import type { Prisma } from "@prisma/client";
export const vehicleService = {
  async list(query: VehicleQueryInput) {
    const where: Prisma.VehicleWhereInput = {};
    if (query.search) {
      where.OR = [
        { plateNumber: { contains: query.search, mode: "insensitive" } },
        { model: { contains: query.search, mode: "insensitive" } },
        { driver: { firstName: { contains: query.search, mode: "insensitive" } } },
        { driver: { lastName: { contains: query.search, mode: "insensitive" } } }
      ];
    }
    const { skip, take } = paginationSkipTake(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      vehicleRepository.findMany(where, skip, take),
      vehicleRepository.count(where)
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },
  async get(id: number) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw AppError.notFound("Vehicle not found");
    return vehicle;
  },
  async create(input: CreateVehicleInput) {
    const driver = await driverRepository.findById(input.driverId);
    if (!driver) throw AppError.notFound("Driver not found");
    const vehicleType = await vehicleTypeRepository.findById(input.vehicleTypeId);
    if (!vehicleType) throw AppError.notFound("Vehicle type not found");
    const existingForDriver = await vehicleRepository.findByDriverId(input.driverId);
    if (existingForDriver) throw AppError.conflict("This driver already has a vehicle assigned");
    const existingPlate = await vehicleRepository.findByPlateNumber(input.plateNumber);
    if (existingPlate) throw AppError.conflict("Plate number is already in use");
    return vehicleRepository.create(input);
  },
  async update(id: number, input: UpdateVehicleInput) {
    const current = await vehicleRepository.findById(id);
    if (!current) throw AppError.notFound("Vehicle not found");
    if (input.vehicleTypeId) {
      const vehicleType = await vehicleTypeRepository.findById(input.vehicleTypeId);
      if (!vehicleType) throw AppError.notFound("Vehicle type not found");
    }
    if (input.plateNumber) {
      const existingPlate = await vehicleRepository.findByPlateNumber(input.plateNumber);
      if (existingPlate && existingPlate.id !== id) throw AppError.conflict("Plate number is already in use");
    }
    if (input.driverId && input.driverId !== current.driverId) {
      return prisma.$transaction(async (tx) => {
        const newDriver = await driverRepository.findById(input.driverId as number, tx);
        if (!newDriver) throw AppError.notFound("Driver not found");
        const existingForNewDriver = await vehicleRepository.findByDriverId(input.driverId as number, tx);
        if (existingForNewDriver) throw AppError.conflict("The target driver already has a vehicle assigned");
        return vehicleRepository.update(id, input, tx);
      });
    }
    return vehicleRepository.update(id, input);
  },
  async remove(id: number) {
    const current = await vehicleRepository.findById(id);
    if (!current) throw AppError.notFound("Vehicle not found");
    return vehicleRepository.delete(id);
  }
};
