import { Router } from 'express';
import * as controller from './analytics.controller';

const router = Router();

router.get('/overview', controller.getOverviewStats);
router.get('/tests/:testId', controller.getTestAnalytics);

export default router;
