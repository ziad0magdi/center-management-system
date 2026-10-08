import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { verifyToken, requireAdmin, requireStudent } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

// Student self routes
router.get('/my-groups', requireStudent, StudentController.getMyGroups);

// General & Admin routes
router.get('/', StudentController.getAll);
router.get('/qr/:qrCode', StudentController.getByQR);
router.get('/:id', StudentController.getById);
router.get('/:id/groups', StudentController.getStudentGroups);

// Admin management
router.post('/', requireAdmin, StudentController.create);
router.put('/:id', requireAdmin, StudentController.update);
router.delete('/:id', requireAdmin, StudentController.delete);

// Group enrollments
router.post('/enroll', requireAdmin, StudentController.enroll);
router.post('/unenroll', requireAdmin, StudentController.unenroll);

export default router;
