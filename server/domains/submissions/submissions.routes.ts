import { Router } from 'express';
import { submissionsController } from './submissions.controller.ts';

const router = Router();

router.get('/', (req, res, next) => submissionsController.list(req, res, next));
router.get('/:id', (req, res, next) => submissionsController.getById(req, res, next));
router.post('/', (req, res, next) => submissionsController.create(req, res, next));
router.patch('/:id/status', (req, res, next) => submissionsController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => submissionsController.remove(req, res, next));

export default router;
