import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@vesioh/utils';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    // Client errors (4xx) are expected; log at warn without a stack to avoid noise.
    if (err.statusCode >= 500) {
      logger.error(err.message, { requestId: req.id, code: err.code, path: req.path, err });
    } else {
      logger.warn(err.message, { requestId: req.id, code: err.code, path: req.path });
    }
    res
      .status(err.statusCode)
      .json(errorResponse(err.code, err.message, undefined, req.id));
    return;
  }

  logger.error('Unhandled error', {
    requestId: req.id,
    path: req.path,
    method: req.method,
    err,
  });
  res
    .status(500)
    .json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', undefined, req.id));
}
