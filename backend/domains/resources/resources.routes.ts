import { Router } from 'express';
import { resourcesController } from './resources.controller.ts';

const router = Router();

router.get('/', (req, res, next) => resourcesController.list(req, res, next));
router.get('/:id', (req, res, next) => resourcesController.getById(req, res, next));

export default router;
