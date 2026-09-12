import { Router } from 'express';
import { recruitmentController } from './recruitment.controller.ts';
import { submissionRateLimiter } from '../../middleware/rateLimiter.ts';
import { spamProtection } from '../../middleware/spamProtection.ts';

const router = Router();

// Public recruitment submission
router.post('/apply', submissionRateLimiter, spamProtection, (req, res, next) =>
  recruitmentController.apply(req, res, next)
);

export default router;
