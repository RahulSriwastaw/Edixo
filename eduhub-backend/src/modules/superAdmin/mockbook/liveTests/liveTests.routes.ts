import { Router } from 'express';
import * as controller from './liveTests.controller';

const router = Router();

router.get('/', controller.getLiveTests);
router.patch('/:id/extend', controller.extendLiveTest);

export default router;
