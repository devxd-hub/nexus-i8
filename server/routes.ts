import { Router } from 'express';
import membersRouter from './domains/members/members.routes.ts';
import projectsRouter from './domains/projects/projects.routes.ts';
import eventsRouter from './domains/events/events.routes.ts';
import announcementsRouter from './domains/announcements/announcements.routes.ts';
import archiveRouter from './domains/archive/archive.routes.ts';
import resourcesRouter from './domains/resources/resources.routes.ts';
import submissionsRouter from './domains/submissions/submissions.routes.ts';
import siteConfigRouter from './domains/site-config/siteConfig.routes.ts';
import authRouter from './domains/auth/auth.routes.ts';
import adminRouter from './domains/admin/admin.routes.ts';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    domains: [
      'members',
      'projects',
      'events',
      'announcements',
      'archive',
      'resources',
      'submissions',
      'site-config',
      'auth',
      'admin',
    ],
  });
});

// Domain routes mounting
router.use('/members', membersRouter);
router.use('/projects', projectsRouter);
router.use('/events', eventsRouter);
router.use('/announcements', announcementsRouter);
router.use('/archive', archiveRouter);
router.use('/resources', resourcesRouter);
router.use('/submissions', submissionsRouter);
router.use('/site-config', siteConfigRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);

export default router;
