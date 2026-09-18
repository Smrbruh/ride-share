export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(message: string, status = 400, code = "BAD_REQUEST", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static notFound(message = "Resource not found") {
    return new AppError(message, 404, "NOT_FOUND");
  }
  static conflict(message: string) {
    return new AppError(message, 409, "CONFLICT");
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, "FORBIDDEN");
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }
  static validation(message: string, details?: unknown) {
    return new AppError(message, 422, "VALIDATION_ERROR", details);
  }
}
