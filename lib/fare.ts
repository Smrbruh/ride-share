import type { Prisma } from "@prisma/client";
export function computeFare(baseFare: Prisma.Decimal | number, perKmRate: Prisma.Decimal | number, distanceKm: number): number {
  return Number(baseFare) + distanceKm * Number(perKmRate);
}
