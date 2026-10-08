import { Router } from 'express';
import { StudentNotesController } from '../controllers/student_notes.controller.js';
import { verifyToken, requireStudent } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

// Student personal notes
router.get('/my-notes', requireStudent, StudentNotesController.getAllMyNotes);
router.get('/session/:sessionId', requireStudent, StudentNotesController.getSessionNote);
router.post('/', requireStudent, StudentNotesController.saveNote);

export default router;
