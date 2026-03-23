import { Router } from 'express';
import * as controller from './students.controller';

const router = Router();

router.get('/', controller.getStudentsList);
router.get('/:id/drilldown', controller.getStudentDrilldown);
router.post('/attempts/:attemptId/invalidate', controller.invalidateAttempt);

export default router;
