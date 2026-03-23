import { Router } from 'express';
import * as controller from './announcements.controller';

const router = Router();

router.get('/', controller.getAnnouncements);
router.post('/', controller.createAnnouncement);

export default router;
