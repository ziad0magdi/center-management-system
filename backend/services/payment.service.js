import { PaymentModel } from '../models/payment.model.js';
import { StudentModel } from '../models/student.model.js';
import { GroupModel } from '../models/group.model.js';

export const PaymentService = {
  async recordPayment(data) {
    const { student_id, group_id, target_month, target_year, amount_paid } = data;
    if (!student_id || !group_id || !target_month || !target_year || amount_paid === undefined) {
      throw new Error('Student ID, Group ID, Target Month, Target Year, and Amount Paid are required.');
    }

    const student = await StudentModel.findById(student_id);
    if (!student) {
      throw new Error(`Student with ID ${student_id} not found.`);
    }

    const group = await GroupModel.findById(group_id);
    if (!group) {
      throw new Error(`Group with ID ${group_id} not found.`);
    }

    return PaymentModel.recordPayment({
      student_id: Number(student_id),
      group_id: Number(group_id),
      target_month: Number(target_month),
      target_year: Number(target_year),
      amount_paid: parseFloat(amount_paid)
    });
  },

  async getStudentPayments(studentId) {
    return PaymentModel.findByStudent(studentId);
  },

  async getMonthlyOverview({ month, year, studentId = null }) {
    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const records = await PaymentModel.getMonthlyPaymentMatrix({
      targetMonth,
      targetYear,
      studentId
    });

    const totalExpected = records.reduce((acc, r) => acc + (parseFloat(r.monthly_fee) || 0), 0);
    const totalCollected = records.reduce((acc, r) => acc + (parseFloat(r.total_paid) || 0), 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);
    const paidCount = records.filter(r => r.is_paid).length;
    const unpaidCount = records.length - paidCount;

    return {
      target_month: targetMonth,
      target_year: targetYear,
      summary: {
        total_students_enrolled: records.length,
        paid_count: paidCount,
        unpaid_count: unpaidCount,
        total_expected: totalExpected,
        total_collected: totalCollected,
        total_pending: totalPending,
        collection_rate_percent: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100
      },
      records
    };
  }
};
