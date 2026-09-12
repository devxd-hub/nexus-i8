import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.ts';

export type ValidatorFn = (data: unknown) => { valid: boolean; errors?: string[] };

export function validateBody(validator: ValidatorFn) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.valid) {
      throw new AppError(400, 'Validation Failed', result.errors);
    }
    next();
  };
}
