import { Router } from 'express';
import { queryCanvas, processTool, saveDraftQuestions, getAISettings, updateAISettings } from './ai.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// EduHub Whiteboard Canvas Query (Context-aware AI Assistant)
router.post('/canvas-query', authenticate, queryCanvas);

// AI Settings Management
router.get('/settings', getAISettings);
router.post('/settings', updateAISettings);

// AI Tools Endpoints (PDF to Word / Extractors) 
router.post('/tool-process', processTool);
router.post('/save-draft', saveDraftQuestions);

export default router;
