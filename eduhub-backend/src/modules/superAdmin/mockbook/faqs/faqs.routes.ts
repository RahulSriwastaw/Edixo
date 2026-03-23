import { Router } from 'express';
import * as controller from './faqs.controller';

const router = Router();

router.get('/', controller.getFaqs);
router.post('/', controller.createFaq);

export default router;
