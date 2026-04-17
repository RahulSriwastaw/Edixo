import { Router } from 'express';
import * as controller from './pricing.controller';

const router = Router();

router.get('/plans', controller.getPlans);
router.post('/plans', controller.createPlan);
router.patch('/plans/:id', controller.updatePlan);
router.delete('/plans/:id', controller.deletePlan);

router.get('/subscriptions', controller.getSubscriptions);

export default router;
