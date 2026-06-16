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
    res.status(err.statusCode).json(errorResponse(err.code, err.message));
    return;
  }

  logger.error('Unhandled error', { err, path: req.path, method: req.method });
  res.status(500).json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'));
}
