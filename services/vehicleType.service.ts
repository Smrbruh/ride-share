import { vehicleTypeRepository } from "@/repositories/vehicleType.repository";
import { AppError } from "@/lib/app-error";
import type { CreateVehicleTypeInput, UpdateVehicleTypeInput } from "@/schemas/vehicleType";
export const vehicleTypeService = {
  async list() {
    return vehicleTypeRepository.findMany();
  },
  async get(id: number) {
    const type = await vehicleTypeRepository.findById(id);
    if (!type) throw AppError.notFound("Vehicle type not found");
    return type;
  },
  async create(input: CreateVehicleTypeInput) {
    const existing = await vehicleTypeRepository.findByName(input.typeName);
    if (existing) throw AppError.conflict("Vehicle type name already exists");
    return vehicleTypeRepository.create(input);
  },
  async update(id: number, input: UpdateVehicleTypeInput) {
    const current = await vehicleTypeRepository.findById(id);
    if (!current) throw AppError.notFound("Vehicle type not found");
    if (input.typeName) {
      const existing = await vehicleTypeRepository.findByName(input.typeName);
      if (existing && existing.id !== id) throw AppError.conflict("Vehicle type name already exists");
    }
    return vehicleTypeRepository.update(id, input);
  },
  async remove(id: number) {
    const current = await vehicleTypeRepository.findById(id);
    if (!current) throw AppError.notFound("Vehicle type not found");
    const usageCount = await vehicleTypeRepository.countVehiclesUsingType(id);
    if (usageCount > 0) throw AppError.conflict("Cannot delete a vehicle type that is assigned to vehicles");
    return vehicleTypeRepository.delete(id);
  }
};
