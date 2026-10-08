import { getPool, sql, getMemoryStore } from '../config/db.config.js';

export const AttendanceModel = {
  async markAttendance(sessionId, studentId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('session_id', sql.Int, sessionId)
        .input('student_id', sql.Int, studentId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM attendance WHERE session_id = @session_id AND student_id = @student_id)
          BEGIN
            INSERT INTO attendance (session_id, student_id, attend_time)
            OUTPUT INSERTED.attendance_id, INSERTED.session_id, INSERTED.student_id, INSERTED.attend_time
            VALUES (@session_id, @student_id, GETDATE())
          END
          ELSE
          BEGIN
            SELECT attendance_id, session_id, student_id, attend_time 
            FROM attendance 
            WHERE session_id = @session_id AND student_id = @student_id
          END
        `);
      return result.recordset[0];
    }
    const store = getMemoryStore();
    let att = store.attendance.find(a => a.session_id === Number(sessionId) && a.student_id === Number(studentId));
    if (!att) {
      const newId = store.attendance.length ? Math.max(...store.attendance.map(a => a.attendance_id)) + 1 : 1;
      att = {
        attendance_id: newId,
        session_id: Number(sessionId),
        student_id: Number(studentId),
        attend_time: new Date()
      };
      store.attendance.push(att);
    }
    return att;
  },

  async markAttendanceByQR(sessionId, qrCode) {
    const pool = await getPool();
    if (pool) {
      const studentRes = await pool.request()
        .input('QR_code', sql.VarChar(100), qrCode)
        .query(`SELECT student_ID, full_Name, parent_phone, grade_level FROM students WHERE QR_code = @QR_code`);
      
      const student = studentRes.recordset[0];
      if (!student) {
        throw new Error('Student QR code not found in system');
      }

      // Check enrollment
      const sessionRes = await pool.request()
        .input('session_ID', sql.Int, sessionId)
        .query(`SELECT group_id FROM sessions WHERE session_ID = @session_ID`);
      
      const session = sessionRes.recordset[0];
      if (!session) {
        throw new Error('Session not found');
      }

      const enrollRes = await pool.request()
        .input('student_id', sql.Int, student.student_ID)
        .input('group_id', sql.Int, session.group_id)
        .query(`SELECT 1 FROM student_groups WHERE student_id = @student_id AND group_id = @group_id`);
      
      if (enrollRes.recordset.length === 0) {
        throw new Error(`Student ${student.full_Name} is not enrolled in this group.`);
      }

      const att = await this.markAttendance(sessionId, student.student_ID);
      return {
        ...att,
        student
      };
    }
    const store = getMemoryStore();
    const student = store.students.find(s => s.QR_code === qrCode);
    if (!student) {
      throw new Error('Student QR code not found in system');
    }
    const session = store.sessions.find(s => s.session_ID === Number(sessionId));
    if (!session) {
      throw new Error('Session not found');
    }
    const isEnrolled = store.student_groups.some(sg => sg.student_id === student.student_ID && sg.group_id === session.group_id);
    if (!isEnrolled) {
      throw new Error(`Student ${student.full_Name} is not enrolled in this group.`);
    }
    const att = await this.markAttendance(sessionId, student.student_ID);
    const { password, ...studentSafe } = student;
    return {
      ...att,
      student: studentSafe
    };
  },

  async getSessionAttendance(sessionId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('session_id', sql.Int, sessionId)
        .query(`
          SELECT a.attendance_id, a.session_id, a.student_id, a.attend_time,
                 s.full_Name, s.student_phone, s.parent_phone, s.grade_level, s.QR_code
          FROM attendance a
          INNER JOIN students s ON a.student_id = s.student_ID
          WHERE a.session_id = @session_id
          ORDER BY a.attend_time DESC
        `);
      return result.recordset;
    }
    const store = getMemoryStore();
    const sessionAtts = store.attendance.filter(a => a.session_id === Number(sessionId));
    return sessionAtts.map(a => {
      const student = store.students.find(s => s.student_ID === a.student_id) || {};
      const { password, ...safeStudent } = student;
      return {
        ...a,
        ...safeStudent
      };
    });
  },

  async getAbsentStudents(sessionId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('session_id', sql.Int, sessionId)
        .query(`
          SELECT s.student_ID, s.full_Name, s.student_phone, s.parent_phone, s.grade_level, s.QR_code,
                 ses.session_ID, ses.session_title, CONVERT(VARCHAR(10), ses.session_date, 120) AS session_date,
                 g.group_id, g.group_name
          FROM sessions ses
          INNER JOIN groups g ON ses.group_id = g.group_id
          INNER JOIN student_groups sg ON g.group_id = sg.group_id
          INNER JOIN students s ON sg.student_id = s.student_ID
          WHERE ses.session_ID = @session_id
            AND s.student_ID NOT IN (
              SELECT student_id FROM attendance WHERE session_id = @session_id
            )
          ORDER BY s.full_Name ASC
        `);
      return result.recordset;
    }
    const store = getMemoryStore();
    const session = store.sessions.find(ses => ses.session_ID === Number(sessionId));
    if (!session) return [];
    const group = store.groups.find(g => g.group_id === session.group_id);
    const enrolledStudentIds = store.student_groups
      .filter(sg => sg.group_id === session.group_id)
      .map(sg => sg.student_id);
    const attendedStudentIds = store.attendance
      .filter(a => a.session_id === Number(sessionId))
      .map(a => a.student_id);
    const absentIds = enrolledStudentIds.filter(id => !attendedStudentIds.includes(id));

    return absentIds.map(id => {
      const s = store.students.find(st => st.student_ID === id) || {};
      const { password, ...safeStudent } = s;
      return {
        ...safeStudent,
        session_ID: session.session_ID,
        session_title: session.session_title,
        session_date: session.session_date,
        group_id: session.group_id,
        group_name: group ? group.group_name : 'N/A'
      };
    });
  },

  async removeAttendance(sessionId, studentId) {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('session_id', sql.Int, sessionId)
        .input('student_id', sql.Int, studentId)
        .query(`DELETE FROM attendance WHERE session_id = @session_id AND student_id = @student_id`);
      return true;
    }
    const store = getMemoryStore();
    store.attendance = store.attendance.filter(a => !(a.session_id === Number(sessionId) && a.student_id === Number(studentId)));
    return true;
  }
};
