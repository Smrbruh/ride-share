import type { Prisma } from "@prisma/client";
import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/lib/app-error";
import { paginationSkipTake } from "@/lib/pagination";
import type { UpdateUserInput, UserQueryInput } from "@/schemas/user";
export const userService = {
  async list(query: UserQueryInput) {
    const where: Prisma.UserWhereInput = {};
    if (query.status) where.status = query.status;
    else where.status = { not: "deleted" };
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } }
      ];
    }
    const { skip, take } = paginationSkipTake(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      userRepository.findMany(where, skip, take),
      userRepository.count(where)
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },
  async get(id: number) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound("User not found");
    return user;
  },
  async update(id: number, input: UpdateUserInput) {
    const current = await userRepository.findById(id);
    if (!current) throw AppError.notFound("User not found");
    return userRepository.update(id, input);
  },
  async suspend(id: number) {
    const current = await userRepository.findById(id);
    if (!current) throw AppError.notFound("User not found");
    if (current.status === "deleted") throw AppError.conflict("Cannot suspend a deleted user");
    return userRepository.update(id, { status: "suspended" });
  },
  async activate(id: number) {
    const current = await userRepository.findById(id);
    if (!current) throw AppError.notFound("User not found");
    if (current.status === "deleted") throw AppError.conflict("Cannot activate a deleted user");
    return userRepository.update(id, { status: "active" });
  },
  async softDelete(id: number) {
    const current = await userRepository.findById(id);
    if (!current) throw AppError.notFound("User not found");
    if (current.status === "deleted") throw AppError.conflict("User is already deleted");
    return userRepository.update(id, { status: "deleted" });
  }
};
