import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { verifyToken, requireTeacher } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

// Real-time QR Code scanning endpoint for attendance
router.post('/scan-qr', requireTeacher, AttendanceController.markByQR);

// Manual attendance
router.post('/mark', requireTeacher, AttendanceController.mark);

// Session attendance records
router.get('/session/:sessionId', AttendanceController.getSessionAttendance);

// Absent students for a session
router.get('/session/:sessionId/absent', AttendanceController.getAbsentStudents);

// Trigger Send Absence WhatsApp to parents
router.post('/session/:sessionId/send-whatsapp', requireTeacher, AttendanceController.sendAbsenceWhatsApp);

// Delete attendance record
router.delete('/session/:sessionId/student/:studentId', requireTeacher, AttendanceController.delete);

export default router;
