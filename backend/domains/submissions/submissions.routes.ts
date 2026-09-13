import { Router } from 'express';
import { submissionsController } from './submissions.controller.ts';
import { requireAuth } from '../../middleware/auth.ts';
import { submissionRateLimiter } from '../../middleware/rateLimiter.ts';
import { spamProtection } from '../../middleware/spamProtection.ts';

const router = Router();

// Public submission creation (Rate-limited and Spam-protected)
router.post('/', submissionRateLimiter, spamProtection, (req, res, next) =>
  submissionsController.create(req, res, next)
);

// Protected administrative inspection & management (Requires active admin session)
router.get('/', requireAuth, (req, res, next) => submissionsController.list(req, res, next));
router.get('/:id', requireAuth, (req, res, next) => submissionsController.getById(req, res, next));
router.patch('/:id/status', requireAuth, (req, res, next) => submissionsController.updateStatus(req, res, next));
router.delete('/:id', requireAuth, (req, res, next) => submissionsController.remove(req, res, next));

export default router;

