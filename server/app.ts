import express, { Express, Request, Response, NextFunction } from 'express';
import { config } from './config/index.ts';
import { requestIdMiddleware } from './middleware/requestId.ts';
import { securityHeaders } from './middleware/securityHeaders.ts';
import { requestLogger } from './middleware/requestLogger.ts';
import { apiRateLimiter } from './middleware/rateLimiter.ts';
import { errorHandler, AppError } from './middleware/errorHandler.ts';
import apiRouter from './routes.ts';

import { runMigrations } from './db/migrate.ts';
import { seedDatabase } from './db/seed.ts';
import { membersRepository } from './db/repositories/members.repository.ts';

function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return true; // Server-to-server, curl, or same-origin
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;

  // In non-production, allow any localhost or 127.0.0.1 port for developer ease
  if (!config.isProduction) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return true;
    }
  }

  return false;
}

export function createApp(): Express {
  // Ensure database schema is migrated and seeded with demo/dev records
  runMigrations();
  if (membersRepository.count() === 0) {
    seedDatabase();
  }

  const app = express();

  // 1. Request ID attribution for end-to-end tracing
  app.use(requestIdMiddleware);

  // 2. Production HTTP security headers
  app.use(securityHeaders);

  // 3. Strict CORS Origin verification
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const allowed = isOriginAllowed(origin, config.cors.allowedOrigins);

    if (allowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    } else if (config.cors.allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-Id'
    );
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  // 4. Body parsing with safe size bounds
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 5. Structured request logging
  app.use(requestLogger);

  // 6. Global API Rate Limiter
  app.use(config.apiPrefix, apiRateLimiter);

  // 7. Mount API router under configured prefix (default: /api)
  app.use(config.apiPrefix, apiRouter);

  // 8. 404 Handler for undefined API routes
  app.use(`${config.apiPrefix}/*`, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(404, `API Route not found: ${req.method} ${req.originalUrl}`));
  });

  // 9. Centralized Error Handler with error IDs
  app.use(errorHandler);

  return app;
}
