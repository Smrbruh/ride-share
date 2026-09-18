import { Prisma } from "@prisma/client";
import { promoCodeRepository } from "@/repositories/promoCode.repository";
import { AppError } from "@/lib/app-error";
import { paginationSkipTake } from "@/lib/pagination";
import type { CreatePromoCodeInput, UpdatePromoCodeInput, PromoCodeQueryInput } from "@/schemas/promoCode";
export const promoCodeService = {
  async list(query: PromoCodeQueryInput) {
    const { skip, take } = paginationSkipTake(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      promoCodeRepository.findMany({}, skip, take),
      promoCodeRepository.count({})
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  },
  async get(id: number) {
    const promo = await promoCodeRepository.findById(id);
    if (!promo) throw AppError.notFound("Promo code not found");
    return promo;
  },
  async create(input: CreatePromoCodeInput) {
    const existing = await promoCodeRepository.findByCode(input.code);
    if (existing) throw AppError.conflict("Promo code already exists");
    return promoCodeRepository.create(input);
  },
  async update(id: number, input: UpdatePromoCodeInput) {
    const current = await promoCodeRepository.findById(id);
    if (!current) throw AppError.notFound("Promo code not found");
    if (input.code) {
      const existing = await promoCodeRepository.findByCode(input.code);
      if (existing && existing.id !== id) throw AppError.conflict("Promo code already exists");
    }
    return promoCodeRepository.update(id, input);
  },
  async remove(id: number) {
    const current = await promoCodeRepository.findById(id);
    if (!current) throw AppError.notFound("Promo code not found");
    const usageCount = await promoCodeRepository.countUsage(id);
    if (usageCount > 0) throw AppError.conflict("Cannot delete a promo code that has already been used");
    try {
      return await promoCodeRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw AppError.conflict("Cannot delete a promo code that has already been used");
      }
      throw error;
    }
  }
};
