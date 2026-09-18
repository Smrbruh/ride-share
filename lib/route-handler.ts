import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/app-error";
import { failure } from "@/lib/api-response";
type AnyRouteHandler = (request: NextRequest, ...rest: any[]) => Promise<NextResponse>;
export function handleRoute<T extends AnyRouteHandler>(handler: T): T {
  return (async (request: NextRequest, ...rest: any[]) => {
    try {
      return await handler(request, ...rest);
    } catch (error) {
      if (error instanceof AppError) return failure(error.message, error.status, error.code, error.details);
      if (error instanceof ZodError) return failure("Validation failed", 422, "VALIDATION_ERROR", error.flatten());
      return failure("Internal server error", 500, "INTERNAL_ERROR");
    }
  }) as T;
}
