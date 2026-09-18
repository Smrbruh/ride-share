import { Prisma } from "@prisma/client";
import { locationRepository } from "@/repositories/location.repository";
import { AppError } from "@/lib/app-error";
import { paginationSkipTake } from "@/lib/pagination";
import type { CreateLocationInput, UpdateLocationInput, LocationQueryInput } from "@/schemas/location";
export const locationService = {
  async list(query: LocationQueryInput) {
    const where: Prisma.LocationWhereInput = {};
    if (query.city) where.city = { equals: query.city, mode: "insensitive" };
    if (query.address) where.address = { contains: query.address, mode: "insensitive" };
    const { skip, take } = paginationSkipTake(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      locationRepository.findMany(where, skip, take),
      locationRepository.count(where)
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },
  async get(id: number) {
    const location = await locationRepository.findById(id);
    if (!location) throw AppError.notFound("Location not found");
    return location;
  },
  async create(input: CreateLocationInput) {
    return locationRepository.create(input);
  },
  async update(id: number, input: UpdateLocationInput) {
    const current = await locationRepository.findById(id);
    if (!current) throw AppError.notFound("Location not found");
    return locationRepository.update(id, input);
  },
  async remove(id: number) {
    const current = await locationRepository.findById(id);
    if (!current) throw AppError.notFound("Location not found");
    try {
      return await locationRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw AppError.conflict("Cannot delete a location referenced by existing rides");
      }
      throw error;
    }
  }
};
