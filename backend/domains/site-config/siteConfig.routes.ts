import { Router } from 'express';
import { siteConfigController } from './siteConfig.controller.ts';

const router = Router();

router.get('/', (req, res, next) => siteConfigController.get(req, res, next));
router.put('/', (req, res, next) => siteConfigController.update(req, res, next));

export default router;
