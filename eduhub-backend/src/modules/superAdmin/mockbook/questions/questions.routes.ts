import { Router } from 'express';
import * as controller from './questions.controller';

const router = Router();

router.get('/', controller.getQuestions);
router.post('/', controller.createQuestion);
router.post('/import', controller.importQuestions);
router.get('/export', controller.exportQuestions);

router.get('/:id', controller.getQuestionDetail);
router.put('/:id', controller.updateQuestion);
router.patch('/:id', controller.updateQuestion);
router.delete('/:id', controller.deleteQuestion);

export default router;
