import { Router } from 'express';
import {
  getAllEidMembers,
  getEidMemberByIdentifier,
  getEidMemberBySlugAndId,
} from './eid.controller.ts';

const router = Router();

// Directory of all public E-ID cards
router.get('/', getAllEidMembers);
router.get('/members', getAllEidMembers);

// Support for canonical route structure: /memberID/:slug/:uniqueId
router.get('/memberID/:slug/:uniqueId', getEidMemberBySlugAndId);
router.get('/members/:slug/:uniqueId', getEidMemberBySlugAndId);

// Direct single-identifier resolution (by unique_id NX-XXX or slug)
router.get('/members/:identifier', getEidMemberByIdentifier);
router.get('/:identifier', getEidMemberByIdentifier);

export default router;
