import { getPool, sql, getMemoryStore } from '../config/db.config.js';

export const StudentNotesModel = {
  async getByStudentAndSession(studentId, sessionId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('student_id', sql.Int, studentId)
        .input('session_id', sql.Int, sessionId)
        .query(`
          SELECT note_id, student_id, session_id, personal_note, created_at
          FROM student_notes
          WHERE student_id = @student_id AND session_id = @session_id
        `);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    return store.student_notes.find(n => n.student_id === Number(studentId) && n.session_id === Number(sessionId)) || null;
  },

  async getAllForStudent(studentId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('student_id', sql.Int, studentId)
        .query(`
          SELECT sn.note_id, sn.student_id, sn.session_id, sn.personal_note, sn.created_at,
                 s.session_title, CONVERT(VARCHAR(10), s.session_date, 120) AS session_date, s.homework_notes,
                 g.group_name
          FROM student_notes sn
          INNER JOIN sessions s ON sn.session_id = s.session_ID
          INNER JOIN groups g ON s.group_id = g.group_id
          WHERE sn.student_id = @student_id
          ORDER BY sn.created_at DESC
        `);
      return result.recordset;
    }
    const store = getMemoryStore();
    return store.student_notes
      .filter(sn => sn.student_id === Number(studentId))
      .map(sn => {
        const session = store.sessions.find(s => s.session_ID === sn.session_id) || {};
        const grp = store.groups.find(g => g.group_id === session.group_id) || {};
        return {
          ...sn,
          session_title: session.session_title || 'N/A',
          session_date: session.session_date || 'N/A',
          homework_notes: session.homework_notes || '',
          group_name: grp.group_name || 'N/A'
        };
      });
  },

  async upsert({ student_id, session_id, personal_note }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('student_id', sql.Int, studentId)
        .input('session_id', sql.Int, sessionId)
        .input('personal_note', sql.NVarChar(sql.MAX), personal_note)
        .query(`
          IF EXISTS (SELECT 1 FROM student_notes WHERE student_id = @student_id AND session_id = @session_id)
          BEGIN
            UPDATE student_notes
            SET personal_note = @personal_note, created_at = GETDATE()
            OUTPUT INSERTED.note_id, INSERTED.student_id, INSERTED.session_id, INSERTED.personal_note, INSERTED.created_at
            WHERE student_id = @student_id AND session_id = @session_id
          END
          ELSE
          BEGIN
            INSERT INTO student_notes (student_id, session_id, personal_note, created_at)
            OUTPUT INSERTED.note_id, INSERTED.student_id, INSERTED.session_id, INSERTED.personal_note, INSERTED.created_at
            VALUES (@student_id, @session_id, @personal_note, GETDATE())
          END
        `);
      return result.recordset[0];
    }
    const store = getMemoryStore();
    let note = store.student_notes.find(n => n.student_id === Number(student_id) && n.session_id === Number(session_id));
    if (note) {
      note.personal_note = personal_note;
      note.created_at = new Date();
    } else {
      const newId = store.student_notes.length ? Math.max(...store.student_notes.map(n => n.note_id)) + 1 : 1;
      note = {
        note_id: newId,
        student_id: Number(student_id),
        session_id: Number(session_id),
        personal_note,
        created_at: new Date()
      };
      store.student_notes.push(note);
    }
    return note;
  }
};
