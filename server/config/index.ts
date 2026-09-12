import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env / .env.local if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: '/api',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  },
  admin: {
    defaultUsername: process.env.ADMIN_DEFAULT_USER || 'admin@nexus.campus',
  },
};
