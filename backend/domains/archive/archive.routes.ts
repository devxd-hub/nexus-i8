import { Router } from 'express';
import { archiveController } from './archive.controller.ts';

const router = Router();

router.get('/', (req, res, next) => archiveController.list(req, res, next));
router.get('/:id', (req, res, next) => archiveController.getById(req, res, next));

export default router;
