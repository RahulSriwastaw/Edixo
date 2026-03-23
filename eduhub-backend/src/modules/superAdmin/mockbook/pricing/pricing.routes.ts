import { Router } from 'express';
import * as controller from './pricing.controller';

const router = Router();

router.get('/', controller.getPricing);
router.post('/', controller.createPricing);

export default router;
