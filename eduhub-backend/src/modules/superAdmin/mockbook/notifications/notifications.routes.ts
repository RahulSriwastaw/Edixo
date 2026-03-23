import { Router } from 'express';
import * as controller from './notificationsCtrl';

const router = Router();

router.get('/', controller.getNotifications);
router.post('/', controller.createNotification);

export default router;
// Triggering IDE TS Server refresh
