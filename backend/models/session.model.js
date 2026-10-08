import { getPool, sql, getMemoryStore } from '../config/db.config.js';

export const SessionModel = {
  async findAll({ groupId = null, teacherId = null, studentId = null } = {}) {
    const pool = await getPool();
    if (pool) {
      let query = `
        SELECT s.session_ID, s.group_id, CONVERT(VARCHAR(10), s.session_date, 120) AS session_date, 
               s.session_title, s.homework_notes, s.completed,
               g.group_name, g.monthly_fee,
               t.teacher_id, t.full_name AS teacher_name, t.Subject AS teacher_subject,
               (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.session_ID) AS attended_count,
               (SELECT COUNT(*) FROM student_groups sg WHERE sg.group_id = s.group_id) AS total_enrolled
        FROM sessions s
        INNER JOIN groups g ON s.group_id = g.group_id
        LEFT JOIN teachers t ON g.teacher_id = t.teacher_id
        WHERE 1=1
      `;
      const request = pool.request();
      if (groupId) {
        request.input('group_id', sql.Int, groupId);
        query += ` AND s.group_id = @group_id`;
      }
      if (teacherId) {
        request.input('teacher_id', sql.Int, teacherId);
        query += ` AND g.teacher_id = @teacher_id`;
      }
      if (studentId) {
        request.input('student_id', sql.Int, studentId);
        query += ` AND s.group_id IN (SELECT group_id FROM student_groups WHERE student_id = @student_id)`;
      }
      query += ` ORDER BY s.session_date DESC, s.session_ID DESC`;
      const result = await request.query(query);
      return result.recordset;
    }
    const store = getMemoryStore();
    return store.sessions
      .filter(s => {
        if (groupId && s.group_id !== Number(groupId)) return false;
        const grp = store.groups.find(g => g.group_id === s.group_id);
        if (!grp) return false;
        if (teacherId && grp.teacher_id !== Number(teacherId)) return false;
        if (studentId) {
          const isEnrolled = store.student_groups.some(sg => sg.student_id === Number(studentId) && sg.group_id === s.group_id);
          if (!isEnrolled) return false;
        }
        return true;
      })
      .map(s => {
        const grp = store.groups.find(g => g.group_id === s.group_id) || {};
        const teacher = store.teachers.find(t => t.teacher_id === grp.teacher_id) || {};
        return {
          ...s,
          group_name: grp.group_name || 'N/A',
          monthly_fee: grp.monthly_fee || 0,
          teacher_id: teacher.teacher_id,
          teacher_name: teacher.full_name || 'N/A',
          teacher_subject: teacher.Subject || 'N/A',
          attended_count: store.attendance.filter(a => a.session_id === s.session_ID).length,
          total_enrolled: store.student_groups.filter(sg => sg.group_id === s.group_id).length
        };
      })
      .sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
  },

  async findById(sessionId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('session_ID', sql.Int, sessionId)
        .query(`
          SELECT s.session_ID, s.group_id, CONVERT(VARCHAR(10), s.session_date, 120) AS session_date, 
                 s.session_title, s.homework_notes, s.completed,
                 g.group_name, g.teacher_id,
                 t.full_name AS teacher_name, t.Subject AS teacher_subject
          FROM sessions s
          INNER JOIN groups g ON s.group_id = g.group_id
          LEFT JOIN teachers t ON g.teacher_id = t.teacher_id
          WHERE s.session_ID = @session_ID
        `);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    const s = store.sessions.find(ses => ses.session_ID === Number(sessionId));
    if (!s) return null;
    const grp = store.groups.find(g => g.group_id === s.group_id) || {};
    const teacher = store.teachers.find(t => t.teacher_id === grp.teacher_id) || {};
    return {
      ...s,
      group_name: grp.group_name || 'N/A',
      teacher_id: teacher.teacher_id,
      teacher_name: teacher.full_name || 'N/A',
      teacher_subject: teacher.Subject || 'N/A'
    };
  },

  async create({ group_id, session_date, session_title, homework_notes = '', completed = false }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('group_id', sql.Int, group_id)
        .input('session_date', sql.Date, session_date)
        .input('session_title', sql.NVarChar(100), session_title)
        .input('homework_notes', sql.NVarChar(sql.MAX), homework_notes || '')
        .input('completed', sql.Bit, completed ? 1 : 0)
        .query(`
          INSERT INTO sessions (group_id, session_date, session_title, homework_notes, completed)
          OUTPUT INSERTED.session_ID, INSERTED.group_id, CONVERT(VARCHAR(10), INSERTED.session_date, 120) AS session_date, 
                 INSERTED.session_title, INSERTED.homework_notes, INSERTED.completed
          VALUES (@group_id, @session_date, @session_title, @homework_notes, @completed)
        `);
      return result.recordset[0];
    }
    const store = getMemoryStore();
    const newId = store.sessions.length ? Math.max(...store.sessions.map(s => s.session_ID)) + 1 : 1;
    const newSession = {
      session_ID: newId,
      group_id: Number(group_id),
      session_date: typeof session_date === 'string' ? session_date : new Date(session_date).toISOString().split('T')[0],
      session_title,
      homework_notes: homework_notes || '',
      completed: Boolean(completed)
    };
    store.sessions.push(newSession);
    return newSession;
  },

  async update(sessionId, { session_date, session_title, homework_notes, completed }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('session_ID', sql.Int, sessionId)
        .input('session_date', sql.Date, session_date)
        .input('session_title', sql.NVarChar(100), session_title)
        .input('homework_notes', sql.NVarChar(sql.MAX), homework_notes || '')
        .input('completed', sql.Bit, completed ? 1 : 0)
        .query(`
          UPDATE sessions
          SET session_date = @session_date,
              session_title = @session_title,
              homework_notes = @homework_notes,
              completed = @completed
          OUTPUT INSERTED.session_ID, INSERTED.group_id, CONVERT(VARCHAR(10), INSERTED.session_date, 120) AS session_date, 
                 INSERTED.session_title, INSERTED.homework_notes, INSERTED.completed
          WHERE session_ID = @session_ID
        `);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    const idx = store.sessions.findIndex(s => s.session_ID === Number(sessionId));
    if (idx === -1) return null;
    store.sessions[idx] = {
      ...store.sessions[idx],
      session_date: typeof session_date === 'string' ? session_date : new Date(session_date).toISOString().split('T')[0],
      session_title,
      homework_notes: homework_notes || '',
      completed: Boolean(completed)
    };
    return store.sessions[idx];
  },

  async updateHomework(sessionId, homeworkNotes) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('session_ID', sql.Int, sessionId)
        .input('homework_notes', sql.NVarChar(sql.MAX), homeworkNotes)
        .query(`
          UPDATE sessions
          SET homework_notes = @homework_notes
          OUTPUT INSERTED.session_ID, INSERTED.group_id, CONVERT(VARCHAR(10), INSERTED.session_date, 120) AS session_date, 
                 INSERTED.session_title, INSERTED.homework_notes, INSERTED.completed
          WHERE session_ID = @session_ID
        `);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    const s = store.sessions.find(ses => ses.session_ID === Number(sessionId));
    if (!s) return null;
    s.homework_notes = homeworkNotes;
    return s;
  },

  async delete(sessionId) {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('session_ID', sql.Int, sessionId)
        .query(`DELETE FROM sessions WHERE session_ID = @session_ID`);
      return true;
    }
    const store = getMemoryStore();
    const idx = store.sessions.findIndex(s => s.session_ID === Number(sessionId));
    if (idx === -1) return false;
    store.sessions.splice(idx, 1);
    store.attendance = store.attendance.filter(a => a.session_id !== Number(sessionId));
    store.student_notes = store.student_notes.filter(sn => sn.session_id !== Number(sessionId));
    return true;
  }
};
