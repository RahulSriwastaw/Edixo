import { Router } from 'express';
import { queryCanvas } from './ai.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// EduHub Whiteboard Canvas Query (Context-aware AI Assistant)
router.post('/canvas-query', authenticate, queryCanvas);

export default router;
