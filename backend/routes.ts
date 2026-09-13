import { Router } from 'express';
import { getDatabase } from './db/connection.ts';
import { storageProvider } from './storage/index.ts';
import membersRouter from './domains/members/members.routes.ts';
import projectsRouter from './domains/projects/projects.routes.ts';
import eventsRouter from './domains/events/events.routes.ts';
import announcementsRouter from './domains/announcements/announcements.routes.ts';
import archiveRouter from './domains/archive/archive.routes.ts';
import resourcesRouter from './domains/resources/resources.routes.ts';
import submissionsRouter from './domains/submissions/submissions.routes.ts';
import recruitmentRouter from './domains/recruitment/recruitment.routes.ts';
import siteConfigRouter from './domains/site-config/siteConfig.routes.ts';
import authRouter from './domains/auth/auth.routes.ts';
import adminRouter from './domains/admin/admin.routes.ts';
import mediaRouter from './domains/media/media.routes.ts';
import eidRouter from './domains/eid/eid.routes.ts';

const router = Router();


// Deep health check endpoint (probes live DB & storage readiness without leaking secrets)
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let storageStatus = 'operational';
  let isHealthy = true;

  try {
    const db = getDatabase();
    const row = db.prepare('SELECT 1 as alive;').get() as { alive: number };
    if (row && row.alive === 1) {
      dbStatus = 'connected';
    } else {
      isHealthy = false;
    }
  } catch {
    dbStatus = 'error';
    isHealthy = false;
  }

  try {
    // Quick test if storage provider is instantiated
    if (typeof storageProvider.getUrl !== 'function') {
      storageStatus = 'degraded';
    }
  } catch {
    storageStatus = 'degraded';
  }

  const memory = process.memoryUsage();
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: '1.0.0',
    checks: {
      database: dbStatus,
      storage: storageStatus,
    },
    metrics: {
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 10) / 10,
      rssMb: Math.round((memory.rss / 1024 / 1024) * 10) / 10,
    },
    domains: [
      'members',
      'projects',
      'events',
      'announcements',
      'archive',
      'resources',
      'submissions',
      'recruitment',
      'site-config',
      'auth',
      'admin',
      'media',
      'eid',
    ],
  });
});

import { publicCache } from './utils/cache.ts';

// Domain routes mounting
router.use('/members', publicCache('members', 60), membersRouter);
router.use('/projects', publicCache('projects', 60), projectsRouter);
router.use('/events', publicCache('events', 60), eventsRouter);
router.use('/announcements', publicCache('announcements', 60), announcementsRouter);
router.use('/archive', publicCache('archive', 60), archiveRouter);
router.use('/resources', publicCache('resources', 60), resourcesRouter);
router.use('/submissions', submissionsRouter);
router.use('/contact', submissionsRouter); // Alias for contact submissions
router.use('/recruitment', recruitmentRouter);
router.use('/site-config', publicCache('site-config', 60), siteConfigRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/media', mediaRouter);
router.use('/eid', publicCache('eid', 60), eidRouter);

export default router;

