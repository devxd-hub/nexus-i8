import { Router } from 'express';
import { membersController } from './members.controller.ts';

const router = Router();

router.get('/', (req, res, next) => membersController.list(req, res, next));
router.get('/:id', (req, res, next) => membersController.getByPublicId(req, res, next));

export default router;
