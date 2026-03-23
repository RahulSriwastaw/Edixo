import { Router } from 'express';
import * as controller from './cutoffs.controller';

const router = Router();

router.get('/', controller.getCutoffs);
router.post('/', controller.createCutoff);

export default router;
