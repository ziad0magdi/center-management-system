import { getPool, sql, getMemoryStore } from '../config/db.config.js';

export const TeacherModel = {
  async findAll() {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request().query(`
        SELECT teacher_id, teacher_ssn, full_name, phone, Subject, user_name 
        FROM teachers 
        ORDER BY full_name ASC
      `);
      return result.recordset;
    }
    return getMemoryStore().teachers.map(({ password, ...rest }) => rest);
  },

  async findById(teacherId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('teacher_id', sql.Int, teacherId)
        .query(`
          SELECT teacher_id, teacher_ssn, full_name, phone, Subject, user_name 
          FROM teachers 
          WHERE teacher_id = @teacher_id
        `);
      return result.recordset[0] || null;
    }
    const t = getMemoryStore().teachers.find(t => t.teacher_id === Number(teacherId));
    if (!t) return null;
    const { password, ...rest } = t;
    return rest;
  },

  async findByUsername(username) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('user_name', sql.VarChar(50), username)
        .query(`
          SELECT * 
          FROM teachers 
          WHERE user_name = @user_name
        `);
      return result.recordset[0] || null;
    }
    return getMemoryStore().teachers.find(t => t.user_name.toLowerCase() === username.toLowerCase()) || null;
  },

  async create({ teacher_ssn, full_name, phone, Subject, user_name, password }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('teacher_ssn', sql.VarChar(14), teacher_ssn)
        .input('full_name', sql.NVarChar(100), full_name)
        .input('phone', sql.VarChar(15), phone)
        .input('Subject', sql.NVarChar(50), Subject)
        .input('user_name', sql.VarChar(50), user_name)
        .input('password', sql.VarChar(255), password)
        .query(`
          INSERT INTO teachers (teacher_ssn, full_name, phone, Subject, user_name, password)
          OUTPUT INSERTED.teacher_id, INSERTED.teacher_ssn, INSERTED.full_name, INSERTED.phone, INSERTED.Subject, INSERTED.user_name
          VALUES (@teacher_ssn, @full_name, @phone, @Subject, @user_name, @password)
        `);
      return result.recordset[0];
    }
    const store = getMemoryStore();
    const newId = store.teachers.length ? Math.max(...store.teachers.map(t => t.teacher_id)) + 1 : 1;
    const newTeacher = { teacher_id: newId, teacher_ssn, full_name, phone, Subject, user_name, password };
    store.teachers.push(newTeacher);
    const { password: _, ...rest } = newTeacher;
    return rest;
  },

  async update(teacherId, { teacher_ssn, full_name, phone, Subject, user_name, password }) {
    const pool = await getPool();
    if (pool) {
      const request = pool.request()
        .input('teacher_id', sql.Int, teacherId)
        .input('teacher_ssn', sql.VarChar(14), teacher_ssn)
        .input('full_name', sql.NVarChar(100), full_name)
        .input('phone', sql.VarChar(15), phone)
        .input('Subject', sql.NVarChar(50), Subject)
        .input('user_name', sql.VarChar(50), user_name);

      let query = `
        UPDATE teachers
        SET teacher_ssn = @teacher_ssn,
            full_name = @full_name,
            phone = @phone,
            Subject = @Subject,
            user_name = @user_name
      `;

      if (password) {
        request.input('password', sql.VarChar(255), password);
        query += `, password = @password`;
      }

      query += `
        OUTPUT INSERTED.teacher_id, INSERTED.teacher_ssn, INSERTED.full_name, INSERTED.phone, INSERTED.Subject, INSERTED.user_name
        WHERE teacher_id = @teacher_id
      `;

      const result = await request.query(query);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    const idx = store.teachers.findIndex(t => t.teacher_id === Number(teacherId));
    if (idx === -1) return null;
    store.teachers[idx] = {
      ...store.teachers[idx],
      teacher_ssn,
      full_name,
      phone,
      Subject,
      user_name,
      ...(password ? { password } : {})
    };
    const { password: _, ...rest } = store.teachers[idx];
    return rest;
  },

  async delete(teacherId) {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('teacher_id', sql.Int, teacherId)
        .query(`
          DELETE FROM teachers WHERE teacher_id = @teacher_id
        `);
      return true;
    }
    const store = getMemoryStore();
    const idx = store.teachers.findIndex(t => t.teacher_id === Number(teacherId));
    if (idx === -1) return false;
    store.teachers.splice(idx, 1);
    return true;
  },

  async getGroups(teacherId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('teacher_id', sql.Int, teacherId)
        .query(`
          SELECT g.*, 
            (SELECT COUNT(*) FROM student_groups sg WHERE sg.group_id = g.group_id) AS student_count,
            (SELECT COUNT(*) FROM sessions s WHERE s.group_id = g.group_id) AS session_count
          FROM groups g
          WHERE g.teacher_id = @teacher_id
          ORDER BY g.group_name ASC
        `);
      return result.recordset;
    }
    const store = getMemoryStore();
    return store.groups
      .filter(g => g.teacher_id === Number(teacherId))
      .map(g => ({
        ...g,
        student_count: store.student_groups.filter(sg => sg.group_id === g.group_id).length,
        session_count: store.sessions.filter(s => s.group_id === g.group_id).length
      }));
  }
};
