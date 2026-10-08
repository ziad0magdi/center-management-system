import { getPool, sql, getMemoryStore } from '../config/db.config.js';

export const GroupModel = {
  async findAll({ teacherId = null, isActive = null } = {}) {
    const pool = await getPool();
    if (pool) {
      let query = `
        SELECT g.group_id, g.teacher_id, g.group_name, g.monthly_fee, g.is_active,
               t.full_name AS teacher_name, t.phone AS teacher_phone, t.Subject AS teacher_subject,
               (SELECT COUNT(*) FROM student_groups sg WHERE sg.group_id = g.group_id) AS student_count,
               (SELECT COUNT(*) FROM sessions s WHERE s.group_id = g.group_id) AS session_count
        FROM groups g
        LEFT JOIN teachers t ON g.teacher_id = t.teacher_id
        WHERE 1=1
      `;
      const request = pool.request();
      if (teacherId) {
        request.input('teacher_id', sql.Int, teacherId);
        query += ` AND g.teacher_id = @teacher_id`;
      }
      if (isActive !== null) {
        request.input('is_active', sql.Bit, isActive ? 1 : 0);
        query += ` AND g.is_active = @is_active`;
      }
      query += ` ORDER BY g.group_name ASC`;
      const result = await request.query(query);
      return result.recordset;
    }
    const store = getMemoryStore();
    return store.groups
      .filter(g => {
        if (teacherId && g.teacher_id !== Number(teacherId)) return false;
        if (isActive !== null && g.is_active !== (isActive === true || isActive === 'true')) return false;
        return true;
      })
      .map(g => {
        const teacher = store.teachers.find(t => t.teacher_id === g.teacher_id) || {};
        return {
          ...g,
          teacher_name: teacher.full_name || 'N/A',
          teacher_phone: teacher.phone || 'N/A',
          teacher_subject: teacher.Subject || 'N/A',
          student_count: store.student_groups.filter(sg => sg.group_id === g.group_id).length,
          session_count: store.sessions.filter(s => s.group_id === g.group_id).length
        };
      });
  },

  async findById(groupId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('group_id', sql.Int, groupId)
        .query(`
          SELECT g.group_id, g.teacher_id, g.group_name, g.monthly_fee, g.is_active,
                 t.full_name AS teacher_name, t.phone AS teacher_phone, t.Subject AS teacher_subject
          FROM groups g
          LEFT JOIN teachers t ON g.teacher_id = t.teacher_id
          WHERE g.group_id = @group_id
        `);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    const g = store.groups.find(grp => grp.group_id === Number(groupId));
    if (!g) return null;
    const teacher = store.teachers.find(t => t.teacher_id === g.teacher_id) || {};
    return {
      ...g,
      teacher_name: teacher.full_name || 'N/A',
      teacher_phone: teacher.phone || 'N/A',
      teacher_subject: teacher.Subject || 'N/A'
    };
  },

  async create({ teacher_id, group_name, monthly_fee, is_active = true }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('teacher_id', sql.Int, teacher_id)
        .input('group_name', sql.NVarChar(100), group_name)
        .input('monthly_fee', sql.Decimal(10, 2), monthly_fee)
        .input('is_active', sql.Bit, is_active ? 1 : 0)
        .query(`
          INSERT INTO groups (teacher_id, group_name, monthly_fee, is_active)
          OUTPUT INSERTED.group_id, INSERTED.teacher_id, INSERTED.group_name, INSERTED.monthly_fee, INSERTED.is_active
          VALUES (@teacher_id, @group_name, @monthly_fee, @is_active)
        `);
      return result.recordset[0];
    }
    const store = getMemoryStore();
    const newId = store.groups.length ? Math.max(...store.groups.map(g => g.group_id)) + 1 : 1;
    const newGroup = {
      group_id: newId,
      teacher_id: Number(teacher_id),
      group_name,
      monthly_fee: parseFloat(monthly_fee),
      is_active: Boolean(is_active)
    };
    store.groups.push(newGroup);
    return newGroup;
  },

  async update(groupId, { teacher_id, group_name, monthly_fee, is_active }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('group_id', sql.Int, groupId)
        .input('teacher_id', sql.Int, teacher_id)
        .input('group_name', sql.NVarChar(100), group_name)
        .input('monthly_fee', sql.Decimal(10, 2), monthly_fee)
        .input('is_active', sql.Bit, is_active ? 1 : 0)
        .query(`
          UPDATE groups
          SET teacher_id = @teacher_id,
              group_name = @group_name,
              monthly_fee = @monthly_fee,
              is_active = @is_active
          OUTPUT INSERTED.group_id, INSERTED.teacher_id, INSERTED.group_name, INSERTED.monthly_fee, INSERTED.is_active
          WHERE group_id = @group_id
        `);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    const idx = store.groups.findIndex(g => g.group_id === Number(groupId));
    if (idx === -1) return null;
    store.groups[idx] = {
      ...store.groups[idx],
      teacher_id: Number(teacher_id),
      group_name,
      monthly_fee: parseFloat(monthly_fee),
      is_active: Boolean(is_active)
    };
    return store.groups[idx];
  },

  async delete(groupId) {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('group_id', sql.Int, groupId)
        .query(`DELETE FROM groups WHERE group_id = @group_id`);
      return true;
    }
    const store = getMemoryStore();
    const idx = store.groups.findIndex(g => g.group_id === Number(groupId));
    if (idx === -1) return false;
    store.groups.splice(idx, 1);
    store.student_groups = store.student_groups.filter(sg => sg.group_id !== Number(groupId));
    return true;
  },

  async getGroupStudents(groupId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('group_id', sql.Int, groupId)
        .query(`
          SELECT s.student_ID, s.full_Name, s.student_phone, s.parent_phone, s.grade_level, s.QR_code, s.user_name, sg.enrollment_Date
          FROM student_groups sg
          INNER JOIN students s ON sg.student_id = s.student_ID
          WHERE sg.group_id = @group_id
          ORDER BY s.full_Name ASC
        `);
      return result.recordset;
    }
    const store = getMemoryStore();
    const enrollments = store.student_groups.filter(sg => sg.group_id === Number(groupId));
    return enrollments.map(e => {
      const student = store.students.find(s => s.student_ID === e.student_id) || {};
      const { password, ...rest } = student;
      return {
        ...rest,
        enrollment_Date: e.enrollment_Date
      };
    });
  }
};
