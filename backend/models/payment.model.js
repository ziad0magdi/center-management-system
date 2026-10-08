import { getPool, sql, getMemoryStore } from '../config/db.config.js';

export const PaymentModel = {
  async recordPayment({ student_id, group_id, target_month, target_year, amount_paid }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('student_id', sql.Int, student_id)
        .input('group_id', sql.Int, group_id)
        .input('target_month', sql.Int, target_month)
        .input('target_year', sql.Int, target_year)
        .input('amount_paid', sql.Decimal(10, 2), amount_paid)
        .query(`
          INSERT INTO payments (student_id, group_id, target_month, target_year, amount_paid, payment_date)
          OUTPUT INSERTED.payment_id, INSERTED.student_id, INSERTED.group_id, 
                 INSERTED.target_month, INSERTED.target_year, INSERTED.amount_paid, INSERTED.payment_date
          VALUES (@student_id, @group_id, @target_month, @target_year, @amount_paid, GETDATE())
        `);
      return result.recordset[0];
    }
    const store = getMemoryStore();
    const newId = store.payments.length ? Math.max(...store.payments.map(p => p.payment_id)) + 1 : 1;
    const newPayment = {
      payment_id: newId,
      student_id: Number(student_id),
      group_id: Number(group_id),
      target_month: Number(target_month),
      target_year: Number(target_year),
      amount_paid: parseFloat(amount_paid),
      payment_date: new Date()
    };
    store.payments.push(newPayment);
    return newPayment;
  },

  async findByStudent(studentId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('student_id', sql.Int, studentId)
        .query(`
          SELECT p.payment_id, p.student_id, p.group_id, p.target_month, p.target_year, p.amount_paid, p.payment_date,
                 g.group_name, g.monthly_fee
          FROM payments p
          INNER JOIN groups g ON p.group_id = g.group_id
          WHERE p.student_id = @student_id
          ORDER BY p.target_year DESC, p.target_month DESC, p.payment_date DESC
        `);
      return result.recordset;
    }
    const store = getMemoryStore();
    return store.payments
      .filter(p => p.student_id === Number(studentId))
      .map(p => {
        const grp = store.groups.find(g => g.group_id === p.group_id) || {};
        return {
          ...p,
          group_name: grp.group_name || 'N/A',
          monthly_fee: grp.monthly_fee || 0
        };
      })
      .sort((a, b) => b.target_year - a.target_year || b.target_month - a.target_month);
  },

  async getMonthlyPaymentMatrix({ targetMonth, targetYear, studentId = null }) {
    const month = targetMonth ? Number(targetMonth) : new Date().getMonth() + 1;
    const year = targetYear ? Number(targetYear) : new Date().getFullYear();

    const pool = await getPool();
    if (pool) {
      let query = `
        SELECT 
          s.student_ID, s.full_Name, s.parent_phone, s.grade_level, s.QR_code,
          g.group_id, g.group_name, g.monthly_fee,
          t.full_name AS teacher_name,
          COALESCE(SUM(p.amount_paid), 0) AS total_paid,
          MAX(p.payment_date) AS last_payment_date
        FROM student_groups sg
        INNER JOIN students s ON sg.student_id = s.student_ID
        INNER JOIN groups g ON sg.group_id = g.group_id
        LEFT JOIN teachers t ON g.teacher_id = t.teacher_id
        LEFT JOIN payments p ON p.student_id = s.student_ID 
                            AND p.group_id = g.group_id 
                            AND p.target_month = @target_month 
                            AND p.target_year = @target_year
        WHERE 1=1
      `;
      const request = pool.request()
        .input('target_month', sql.Int, month)
        .input('target_year', sql.Int, year);

      if (studentId) {
        request.input('student_id', sql.Int, studentId);
        query += ` AND s.student_ID = @student_id`;
      }

      query += `
        GROUP BY s.student_ID, s.full_Name, s.parent_phone, s.grade_level, s.QR_code,
                 g.group_id, g.group_name, g.monthly_fee, t.full_name
        ORDER BY s.full_Name ASC, g.group_name ASC
      `;

      const result = await request.query(query);
      return result.recordset.map(item => ({
        ...item,
        target_month: month,
        target_year: year,
        is_paid: item.total_paid >= item.monthly_fee,
        status: item.total_paid >= item.monthly_fee ? 'PAID' : (item.total_paid > 0 ? 'PARTIAL' : 'UNPAID'),
        remaining_balance: Math.max(0, item.monthly_fee - item.total_paid)
      }));
    }

    const store = getMemoryStore();
    const enrollments = store.student_groups.filter(sg => {
      if (studentId) return sg.student_id === Number(studentId);
      return true;
    });

    return enrollments.map(e => {
      const student = store.students.find(s => s.student_ID === e.student_id) || {};
      const group = store.groups.find(g => g.group_id === e.group_id) || {};
      const teacher = store.teachers.find(t => t.teacher_id === group.teacher_id) || {};
      
      const relevantPayments = store.payments.filter(p => 
        p.student_id === e.student_id &&
        p.group_id === e.group_id &&
        p.target_month === month &&
        p.target_year === year
      );

      const total_paid = relevantPayments.reduce((acc, p) => acc + (parseFloat(p.amount_paid) || 0), 0);
      const monthly_fee = parseFloat(group.monthly_fee) || 0;
      const is_paid = total_paid >= monthly_fee;
      const status = total_paid >= monthly_fee ? 'PAID' : (total_paid > 0 ? 'PARTIAL' : 'UNPAID');

      return {
        student_ID: student.student_ID,
        full_Name: student.full_Name,
        parent_phone: student.parent_phone,
        grade_level: student.grade_level,
        QR_code: student.QR_code,
        group_id: group.group_id,
        group_name: group.group_name,
        monthly_fee,
        teacher_name: teacher.full_name || 'N/A',
        total_paid,
        target_month: month,
        target_year: year,
        is_paid,
        status,
        remaining_balance: Math.max(0, monthly_fee - total_paid),
        last_payment_date: relevantPayments.length ? relevantPayments[relevantPayments.length - 1].payment_date : null
      };
    });
  }
};
