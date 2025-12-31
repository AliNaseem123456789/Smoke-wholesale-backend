import { Router } from 'express';
import { testSupabase } from '../controllers/test.controller';

const router = Router();

router.get('/supabase', testSupabase);

export default router;
