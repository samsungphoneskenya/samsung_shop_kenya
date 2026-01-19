/**
 * Standardized API response helpers
 */

export function successResponse<T>(data: T, status: number = 200) {
  return Response.json({ data }, { status });
}

export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
) {
  return Response.json(
    {
      error: {
        message,
        ...(code && { code }),
      },
    },
    { status }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validationErrorResponse(errors: any) {
  return Response.json(
    {
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors,
      },
    },
    { status: 400 }
  );
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return Response.json(
    {
      error: {
        message,
        code: "UNAUTHORIZED",
      },
    },
    { status: 401 }
  );
}

export function notFoundResponse(message: string = "Resource not found") {
  return Response.json(
    {
      error: {
        message,
        code: "NOT_FOUND",
      },
    },
    { status: 404 }
  );
}
