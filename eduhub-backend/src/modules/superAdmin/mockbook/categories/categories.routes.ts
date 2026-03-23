import { Router } from 'express';
import * as controller from './categories.controller';

const router = Router();

router.get('/', controller.getCategories);
router.post('/', controller.createCategory);
router.patch('/:id', controller.updateCategory);
router.put('/:id', controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

export default router;
