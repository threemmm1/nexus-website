import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { errorResponse } from '@vesioh/utils';
import type { UserRole } from '@vesioh/types';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: UserRole };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json(errorResponse('INVALID_TOKEN', 'Invalid or expired token'));
    return;
  }

  req.user = { userId: payload.userId, role: payload.role };
  next();
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json(errorResponse('FORBIDDEN', 'Insufficient permissions'));
      return;
    }
    next();
  };
}
