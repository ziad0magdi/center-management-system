import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { verifyToken, requireAdmin, requireStudent } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

// Admin: monthly payment overview & matrix tracking
router.get('/overview', requireAdmin, PaymentController.getMonthlyOverview);

// Admin: record payment
router.post('/record', requireAdmin, PaymentController.recordPayment);

// Student self payment status & history
router.get('/my-status', requireStudent, PaymentController.getMyMonthlyStatus);
router.get('/my-payments', requireStudent, PaymentController.getMyPayments);

// Student payments by ID (Admin)
router.get('/student/:studentId', requireAdmin, PaymentController.getStudentPayments);

export default router;
