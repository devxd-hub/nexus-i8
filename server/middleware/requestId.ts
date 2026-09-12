import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

// Extend Express Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Middleware to assign or propagate a unique request ID for distributed tracing.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && incomingId.trim().length > 0 && incomingId.length <= 128
      ? incomingId.trim()
      : `req_${crypto.randomUUID()}`;

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
}
