import { Router } from 'express';
import * as controller from './tests.controller';

const router = Router();

router.get('/', controller.getTests);
router.post('/', controller.createTest);
router.get('/:id', controller.getTestDetail);
router.patch('/:id', controller.updateTest);
router.put('/:id', controller.updateTest);
router.delete('/:id', controller.deleteTest);

// Custom Mock Test actions
router.patch('/:id/status', controller.updateTestStatus);
router.post('/:id/clone', controller.cloneTest);

// Sections management
router.post('/:id/sections', controller.addTestSection);
router.delete('/:id/sections/:sectionId', controller.removeTestSection);

export default router;
