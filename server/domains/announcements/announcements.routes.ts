import { Router } from 'express';
import { announcementsController } from './announcements.controller.ts';

const router = Router();

router.get('/', (req, res, next) => announcementsController.list(req, res, next));
router.get('/:id', (req, res, next) => announcementsController.getById(req, res, next));

export default router;
