import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

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
  const errStatusCode = 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500;
  const isPayloadTooLarge = (err as any).type === 'entity.too.large' || errStatusCode === 413;
  const finalStatusCode = isPayloadTooLarge ? 413 : errStatusCode;
  const isInternalError = finalStatusCode >= 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Generate unique incident reference for 500 errors
  const errorId = isInternalError
    ? `err_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`
    : undefined;

  const code = isPayloadTooLarge
    ? 'FILE_TOO_LARGE'
    : 'code' in err && typeof err.code === 'string'
    ? err.code
    : getErrorCode(finalStatusCode);

  // In production, do not leak internal database errors or stack details
  let message: string;
  if (isPayloadTooLarge) {
    message = 'Payload size exceeds the allowable limit';
  } else if (isInternalError && isProduction) {
    message = 'An internal server error occurred. Please quote error reference ID.';
  } else {
    message = err.message || 'Internal Server Error';
  }

  const details = 'details' in err ? err.details : undefined;
  const requestId = req.id || (res.getHeader('X-Request-Id') as string) || undefined;

  if (isInternalError) {
    console.error(
      `[Error] Unhandled exception [errorId=${errorId}, requestId=${requestId}] on ${req.method} ${req.originalUrl}:`,
      err
    );
  }

  res.status(finalStatusCode).json({
    data: null,
    meta: null,
    error: {
      code,
      message,
      ...(errorId ? { errorId } : {}),
      ...(requestId ? { requestId } : {}),
      ...(details !== undefined && !isProduction ? { details } : {}),
    },
  });
}
