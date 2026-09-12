import express, { Express, Request, Response, NextFunction } from 'express';
import { config } from './config/index.ts';
import { requestLogger } from './middleware/requestLogger.ts';
import { errorHandler, AppError } from './middleware/errorHandler.ts';
import apiRouter from './routes.ts';

import { runMigrations } from './db/migrate.ts';
import { seedDatabase } from './db/seed.ts';
import { membersRepository } from './db/repositories/members.repository.ts';

export function createApp(): Express {
  // Ensure database schema is migrated and seeded with demo/dev records
  runMigrations();
  if (membersRepository.count() === 0) {
    seedDatabase();
  }

  const app = express();

  // Basic security and parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', config.cors.origin);
    res.header('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Request logger
  app.use(requestLogger);

  // Mount API router under configured prefix (default: /api)
  app.use(config.apiPrefix, apiRouter);

  // 404 Handler for undefined API routes
  app.use(`${config.apiPrefix}/*`, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(404, `API Route not found: ${req.method} ${req.originalUrl}`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
