import { Router } from 'express';
import { bulkAIEditController } from './bulk-ai-edit.controller';
import {
    bulkAIEditBackgroundController,
    bulkAIEditStatusController,
    bulkAIEditRetryController,
    bulkAIEditListController
} from './bulk-ai-edit-bg.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/questions/bulk-ai-edit
 *
 * Bulk AI edit endpoint with SSE streaming (real-time)
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

/**
 * POST /api/questions/bulk-ai-edit/background
 *
 * Submit bulk AI edit as a background job (non-blocking)
 */
router.post('/bulk-ai-edit/background', authenticate, bulkAIEditBackgroundController);

/**
 * GET /api/questions/bulk-ai-edit/jobs
 *
 * List recent bulk AI edit jobs
 */
router.get('/bulk-ai-edit/jobs', authenticate, bulkAIEditListController);

/**
 * GET /api/questions/bulk-ai-edit/jobs/:jobId/status
 *
 * Get status of a specific background job
 */
router.get('/bulk-ai-edit/jobs/:jobId/status', authenticate, bulkAIEditStatusController);

/**
 * POST /api/questions/bulk-ai-edit/jobs/:jobId/retry
 *
 * Retry failed questions from a previous job
 */
router.post('/bulk-ai-edit/jobs/:jobId/retry', authenticate, bulkAIEditRetryController);

export default router;
