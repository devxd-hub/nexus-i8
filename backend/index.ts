import { createApp } from './app.ts';
import { config } from './config/index.ts';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(`=============================================`);
  console.log(`  NEXUS Backend API Server Running           `);
  console.log(`  Environment: ${config.env}                `);
  console.log(`  Listening on: http://${config.host}:${config.port}`);
  console.log(`  API Health:   http://${config.host}:${config.port}${config.apiPrefix}/health`);
  console.log(`=============================================`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Server] Forced shutdown due to timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
