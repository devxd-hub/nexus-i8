import { Router } from 'express';
import { eventsController } from './events.controller.ts';

const router = Router();

router.get('/', (req, res, next) => eventsController.list(req, res, next));
router.get('/upcoming', (req, res, next) => eventsController.upcoming(req, res, next));
router.get('/past', (req, res, next) => eventsController.past(req, res, next));
router.get('/featured', (req, res, next) => eventsController.featured(req, res, next));
router.get('/:slug', (req, res, next) => eventsController.getBySlug(req, res, next));

export default router;
