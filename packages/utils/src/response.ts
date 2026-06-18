import type { ApiResponse, ApiError, PaginationMeta } from '@vesioh/types';

export function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta !== undefined && { meta }),
    error: null,
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]>,
  requestId?: string,
): ApiError {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
      ...(requestId !== undefined && { requestId }),
    },
  };
}
