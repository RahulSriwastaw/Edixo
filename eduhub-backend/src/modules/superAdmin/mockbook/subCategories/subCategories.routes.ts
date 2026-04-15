import { Router } from 'express';
import * as controller from './subCategories.controller';

const router = Router();

router.get('/', controller.getSubCategories);
router.post('/', controller.createSubCategory);
router.patch('/:id', controller.updateSubCategory);
router.put('/:id', controller.updateSubCategory);
router.delete('/:id', controller.deleteSubCategory);

export default router;
