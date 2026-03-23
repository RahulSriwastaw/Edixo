import { Router } from 'express';
import * as controller from './testSeries.controller';

const router = Router();

router.get('/', controller.getTestSeries);
router.post('/', controller.createTestSeries);
router.get('/:id', controller.getTestSeriesDetail);
router.patch('/:id', controller.updateTestSeries);
router.put('/:id', controller.updateTestSeries);
router.delete('/:id', controller.deleteTestSeries);

export default router;
