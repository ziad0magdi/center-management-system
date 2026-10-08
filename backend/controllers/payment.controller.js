import { PaymentService } from '../services/payment.service.js';

export const PaymentController = {
  async recordPayment(req, res, next) {
    try {
      const payment = await PaymentService.recordPayment(req.body);
      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async getStudentPayments(req, res, next) {
    try {
      const payments = await PaymentService.getStudentPayments(req.params.studentId);
      res.status(200).json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  },

  async getMyPayments(req, res, next) {
    try {
      const studentId = req.user.id || req.user.student_id;
      const payments = await PaymentService.getStudentPayments(studentId);
      res.status(200).json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyOverview(req, res, next) {
    try {
      const { month, year, student_id } = req.query;
      const overview = await PaymentService.getMonthlyOverview({
        month,
        year,
        studentId: student_id
      });
      res.status(200).json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  },

  async getMyMonthlyStatus(req, res, next) {
    try {
      const studentId = req.user.id || req.user.student_id;
      const { month, year } = req.query;
      const overview = await PaymentService.getMonthlyOverview({
        month,
        year,
        studentId
      });
      res.status(200).json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  }
};
