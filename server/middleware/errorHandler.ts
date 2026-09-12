import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public code: string;

  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown,
    code?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code || getErrorCode(statusCode);
    Error.captureStackTrace(this, this.constructor);
  }
}

function getErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const statusCode = 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500;
  const code = 'code' in err && typeof err.code === 'string' ? err.code : getErrorCode(statusCode);
  const message = err.message || 'Internal Server Error';
  const details = 'details' in err ? err.details : undefined;

  if (statusCode === 500) {
    console.error(`[Error] Unhandled exception on ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    data: null,
    meta: null,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
