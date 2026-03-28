import { Router } from 'express';
import { getPitches } from '../controllers/pitch.controller';

const router = Router();

router.get('/', getPitches);

export default router;
