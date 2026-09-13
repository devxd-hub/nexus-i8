import http from 'http';
import fs from 'fs';
import path from 'path';
import { createApp } from '../backend/app.ts';
import { getDatabase } from '../backend/db/connection.ts';

async function measure() {
  const startInit = performance.now();
  const db = getDatabase();
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as { port: number };
  const port = address.port;
  const startupTime = performance.now() - startInit;

  const endpoints = [
    '/api/health',
    '/api/members',
    '/api/projects',
    '/api/events',
    '/api/announcements',
    '/api/archive',
    '/api/resources',
    '/api/site-config',
  ];

  const latencies: Record<string, number> = {};
  for (const ep of endpoints) {
    const t0 = performance.now();
    const res = await fetch(`http://127.0.0.1:${port}${ep}`);
    await res.json();
    latencies[ep] = parseFloat((performance.now() - t0).toFixed(2));
  }

  const mem = process.memoryUsage();
  server.close();

  // Measure dist files
  const distDir = path.resolve(process.cwd(), 'dist/assets');
  let bundleDetails: Record<string, string> = {};
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    for (const f of files) {
      const stats = fs.statSync(path.join(distDir, f));
      bundleDetails[f] = `${(stats.size / 1024).toFixed(2)} KB`;
    }
  }

  console.log('--- PERF_MEASUREMENT_START ---');
  console.log(JSON.stringify({
    backend: {
      startupTimeMs: parseFloat(startupTime.toFixed(2)),
      heapUsedMb: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2)),
      rssMb: parseFloat((mem.rss / 1024 / 1024).toFixed(2)),
      latencies,
    },
    frontend: {
      bundleDetails,
    }
  }, null, 2));
  console.log('--- PERF_MEASUREMENT_END ---');
}

measure().catch((err) => {
  console.error(err);
  process.exit(1);
});
