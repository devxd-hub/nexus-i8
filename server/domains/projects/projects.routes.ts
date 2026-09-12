import { Router } from 'express';
import { projectsController } from './projects.controller.ts';

const router = Router();

router.get('/', (req, res, next) => projectsController.list(req, res, next));
router.get('/featured', (req, res, next) => projectsController.featured(req, res, next));
router.get('/:slug', (req, res, next) => projectsController.getBySlug(req, res, next));
router.get('/:slug/members', (req, res, next) => projectsController.getMembers(req, res, next));
router.get('/:slug/events', (req, res, next) => projectsController.getRelatedEvents(req, res, next));

export default router;
