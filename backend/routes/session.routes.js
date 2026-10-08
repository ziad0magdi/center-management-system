import { Router } from 'express';
import { SessionController } from '../controllers/session.controller.js';
import { verifyToken, requireTeacher } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', SessionController.getAll);
router.get('/:id', SessionController.getById);

// Teacher/Admin session creation and homework assignment
router.post('/', requireTeacher, SessionController.create);
router.put('/:id', requireTeacher, SessionController.update);
router.patch('/:id/homework', requireTeacher, SessionController.updateHomework);
router.delete('/:id', requireTeacher, SessionController.delete);

export default router;
