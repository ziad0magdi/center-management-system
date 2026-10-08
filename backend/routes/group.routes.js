import { Router } from 'express';
import { GroupController } from '../controllers/group.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', GroupController.getAll);
router.get('/:id', GroupController.getById);
router.get('/:id/students', GroupController.getStudents);

router.post('/', requireAdmin, GroupController.create);
router.put('/:id', requireAdmin, GroupController.update);
router.delete('/:id', requireAdmin, GroupController.delete);

export default router;
