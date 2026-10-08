import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller.js';
import { verifyToken, requireAdmin, requireTeacher } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected routes
router.use(verifyToken);

// Teacher-specific view
router.get('/my-groups', requireTeacher, TeacherController.getMyGroups);

// General & Admin routes
router.get('/', TeacherController.getAll);
router.get('/:id', TeacherController.getById);
router.get('/:id/groups', TeacherController.getTeacherGroups);

router.post('/', requireAdmin, TeacherController.create);
router.put('/:id', requireAdmin, TeacherController.update);
router.delete('/:id', requireAdmin, TeacherController.delete);

export default router;
