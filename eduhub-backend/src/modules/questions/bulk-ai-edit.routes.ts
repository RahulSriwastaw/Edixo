import { Router } from 'express';
import { bulkAIEditController } from './bulk-ai-edit.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/questions/bulk-ai-edit
 * 
 * Bulk AI edit endpoint with SSE streaming
 * 
 * Request body:
 * {
 *   question_ids: string[],
 *   edit_type: 'question_variation' | 'language_variation' | 'solution_add' | 'custom',
 *   action?: string,
 *   language?: string,
 *   custom_prompt?: string,
 *   ai_provider: 'gemini' | 'openai' | 'claude',
 *   model: string
 * }
 * 
 * Response: Server-Sent Events stream with edit logs
 */
router.post('/bulk-ai-edit', authenticate, bulkAIEditController);

export default router;
