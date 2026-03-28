import { Router } from 'express';
import { getSlots } from '../controllers/slot.controller';

const router = Router();

router.get('/', getSlots);

export default router;
