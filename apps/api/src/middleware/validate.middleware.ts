import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '@vesioh/utils';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const err = result.error as ZodError;
      const details: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = issue.path.join('.');
        details[key] = [...(details[key] ?? []), issue.message];
      }
      res.status(422).json(errorResponse('VALIDATION_ERROR', 'Validation failed', details));
      return;
    }
    req[target] = result.data;
    next();
  };
}
