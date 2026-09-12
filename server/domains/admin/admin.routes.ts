import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/auth.ts';
import { adminAuthController } from './adminAuth.controller.ts';
import { adminUsersController } from './adminUsers.controller.ts';
import { adminProjectsController } from './adminProjects.controller.ts';
import { adminEventsController } from './adminEvents.controller.ts';
import { adminMembersController } from './adminMembers.controller.ts';
import { adminAnnouncementsController } from './adminAnnouncements.controller.ts';
import { adminArchiveController } from './adminArchive.controller.ts';
import { adminResourcesController } from './adminResources.controller.ts';
import { adminMediaController } from './adminMedia.controller.ts';
import { adminSiteSettingsController } from './adminSiteSettings.controller.ts';
import { adminAuditLogsController } from './adminAuditLogs.controller.ts';

const router = Router();

// ==========================================
// 1. AUTHENTICATION (Public login)
// ==========================================
router.post('/auth/login', (req, res, next) => adminAuthController.login(req, res, next));

// ==========================================
// ALL SUBSEQUENT ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(requireAuth);

router.post('/auth/logout', (req, res, next) => adminAuthController.logout(req, res, next));
router.get('/auth/me', (req, res, next) => adminAuthController.me(req, res, next));

// ==========================================
// 2. ADMIN USERS (Super Admin Only)
// ==========================================
router.get('/users', requireSuperAdmin, (req, res, next) => adminUsersController.list(req, res, next));
router.post('/users', requireSuperAdmin, (req, res, next) => adminUsersController.create(req, res, next));
router.get('/users/:id', requireSuperAdmin, (req, res, next) => adminUsersController.getById(req, res, next));
router.patch('/users/:id', requireSuperAdmin, (req, res, next) => adminUsersController.update(req, res, next));
router.delete('/users/:id', requireSuperAdmin, (req, res, next) => adminUsersController.delete(req, res, next));

// ==========================================
// 3. SITE SETTINGS (Super Admin Only)
// ==========================================
router.get('/site-settings', requireSuperAdmin, (req, res, next) => adminSiteSettingsController.getSettings(req, res, next));
router.put('/site-settings', requireSuperAdmin, (req, res, next) => adminSiteSettingsController.updateSettings(req, res, next));

// ==========================================
// 4. AUDIT LOGS (Super Admin Only)
// ==========================================
router.get('/audit-logs', requireSuperAdmin, (req, res, next) => adminAuditLogsController.list(req, res, next));

// ==========================================
// 5. PROJECTS MANAGEMENT
// ==========================================
router.get('/projects', (req, res, next) => adminProjectsController.list(req, res, next));
router.post('/projects', (req, res, next) => adminProjectsController.create(req, res, next));
router.get('/projects/:id', (req, res, next) => adminProjectsController.getById(req, res, next));
router.put('/projects/:id', (req, res, next) => adminProjectsController.update(req, res, next));
router.patch('/projects/:id/status', (req, res, next) => adminProjectsController.updateStatus(req, res, next));
router.post('/projects/:id/members', (req, res, next) => adminProjectsController.addMember(req, res, next));
router.delete('/projects/:id/members/:memberId', (req, res, next) => adminProjectsController.removeMember(req, res, next));
router.delete('/projects/:id', requireSuperAdmin, (req, res, next) => adminProjectsController.delete(req, res, next));

// ==========================================
// 6. EVENTS MANAGEMENT
// ==========================================
router.get('/events', (req, res, next) => adminEventsController.list(req, res, next));
router.post('/events', (req, res, next) => adminEventsController.create(req, res, next));
router.get('/events/:id', (req, res, next) => adminEventsController.getById(req, res, next));
router.put('/events/:id', (req, res, next) => adminEventsController.update(req, res, next));
router.patch('/events/:id/status', (req, res, next) => adminEventsController.updateStatus(req, res, next));
router.delete('/events/:id', requireSuperAdmin, (req, res, next) => adminEventsController.delete(req, res, next));

// ==========================================
// 7. MEMBERS MANAGEMENT
// ==========================================
router.get('/members', (req, res, next) => adminMembersController.list(req, res, next));
router.post('/members', (req, res, next) => adminMembersController.create(req, res, next));
router.get('/members/:id', (req, res, next) => adminMembersController.getById(req, res, next));
router.put('/members/:id', (req, res, next) => adminMembersController.update(req, res, next));
router.delete('/members/:id', requireSuperAdmin, (req, res, next) => adminMembersController.delete(req, res, next));

// ==========================================
// 8. ANNOUNCEMENTS MANAGEMENT
// ==========================================
router.get('/announcements', (req, res, next) => adminAnnouncementsController.list(req, res, next));
router.post('/announcements', (req, res, next) => adminAnnouncementsController.create(req, res, next));
router.get('/announcements/:id', (req, res, next) => adminAnnouncementsController.getById(req, res, next));
router.put('/announcements/:id', (req, res, next) => adminAnnouncementsController.update(req, res, next));
router.patch('/announcements/:id/status', (req, res, next) => adminAnnouncementsController.updateStatus(req, res, next));
router.delete('/announcements/:id', requireSuperAdmin, (req, res, next) => adminAnnouncementsController.delete(req, res, next));

// ==========================================
// 9. ARCHIVE MANAGEMENT
// ==========================================
router.get('/archive', (req, res, next) => adminArchiveController.list(req, res, next));
router.post('/archive', (req, res, next) => adminArchiveController.create(req, res, next));
router.get('/archive/:id', (req, res, next) => adminArchiveController.getById(req, res, next));
router.put('/archive/:id', (req, res, next) => adminArchiveController.update(req, res, next));
router.patch('/archive/:id/status', (req, res, next) => adminArchiveController.updateStatus(req, res, next));
router.delete('/archive/:id', requireSuperAdmin, (req, res, next) => adminArchiveController.delete(req, res, next));

// ==========================================
// 10. RESOURCES MANAGEMENT
// ==========================================
router.get('/resources', (req, res, next) => adminResourcesController.list(req, res, next));
router.post('/resources', (req, res, next) => adminResourcesController.create(req, res, next));
router.get('/resources/:id', (req, res, next) => adminResourcesController.getById(req, res, next));
router.put('/resources/:id', (req, res, next) => adminResourcesController.update(req, res, next));
router.patch('/resources/:id/status', (req, res, next) => adminResourcesController.updateStatus(req, res, next));
router.delete('/resources/:id', requireSuperAdmin, (req, res, next) => adminResourcesController.delete(req, res, next));

// ==========================================
// 11. MEDIA MANAGEMENT
// ==========================================
router.get('/media', (req, res, next) => adminMediaController.list(req, res, next));
router.post('/media', (req, res, next) => adminMediaController.create(req, res, next));
router.get('/media/:id', (req, res, next) => adminMediaController.getById(req, res, next));
router.put('/media/:id', (req, res, next) => adminMediaController.update(req, res, next));
router.delete('/media/:id', requireSuperAdmin, (req, res, next) => adminMediaController.delete(req, res, next));

export default router;
