import { Router } from 'express';
import { mediaController } from './media.controller.ts';

const router = Router();

// Public media file serving: /api/media/file/*
router.get('/file/*', (req, res, next) => mediaController.serveFile(req, res, next));

// Public media metadata lookup: /api/media/:id
router.get('/:id', (req, res, next) => mediaController.getMetadata(req, res, next));

export default router;
