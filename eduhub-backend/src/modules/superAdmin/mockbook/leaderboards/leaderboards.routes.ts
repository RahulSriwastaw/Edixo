import { Router } from 'express';
import * as controller from './leaderboards.controller';

const router = Router();

router.get('/:testId', controller.getLeaderboard);
router.post('/:testId/recalculate', controller.recalculateLeaderboard);

export default router;
