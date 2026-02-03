import { ZodError } from "zod";
import { PostgrestError } from "@supabase/supabase-js";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "INTERNAL_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, public errors?: any) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

/**
 * Convert various error types to AppError
 */
export function handleError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return new ValidationError("Validation failed", error.issues);
  }

  // Supabase/Postgres error
  if (isPostgrestError(error)) {
    return new AppError(
      error.message,
      error.code,
      error.code === "PGRST116" ? 404 : 500
    );
  }

  // Generic error
  if (error instanceof Error) {
    return new AppError(error.message);
  }

  // Unknown error
  return new AppError("An unknown error occurred");
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error
  );
}

/**
 * Create error response for API routes
 */
export function createErrorResponse(error: AppError) {
  return Response.json(
    {
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { errors: error.errors }),
      },
    },
    { status: error.statusCode }
  );
}

/**
 * Log errors with context
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logError(error: unknown, context?: Record<string, any>) {
  const appError = handleError(error);
  console.error("[ERROR]", {
    name: appError.name,
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    ...context,
    stack: appError.stack,
  });
}
