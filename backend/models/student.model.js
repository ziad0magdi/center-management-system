import { getPool, sql, getMemoryStore } from '../config/db.config.js';

export const StudentModel = {
  async findAll({ search = '', gradeLevel = '' } = {}) {
    const pool = await getPool();
    if (pool) {
      let query = `
        SELECT s.student_ID, s.full_Name, s.student_phone, s.parent_phone, s.grade_level, s.QR_code, s.user_name, s.created_At,
          (SELECT COUNT(*) FROM student_groups sg WHERE sg.student_id = s.student_ID) AS enrolled_groups_count
        FROM students s
        WHERE 1=1
      `;
      const request = pool.request();
      if (search) {
        request.input('search', sql.NVarChar(100), `%${search}%`);
        query += ` AND (s.full_Name LIKE @search OR s.QR_code LIKE @search OR s.user_name LIKE @search OR s.parent_phone LIKE @search)`;
      }
      if (gradeLevel) {
        request.input('gradeLevel', sql.NVarChar(50), gradeLevel);
        query += ` AND s.grade_level = @gradeLevel`;
      }
      query += ` ORDER BY s.created_At DESC, s.full_Name ASC`;
      const result = await request.query(query);
      return result.recordset;
    }
    const store = getMemoryStore();
    return store.students
      .filter(s => {
        const matchesSearch = !search || 
          s.full_Name.toLowerCase().includes(search.toLowerCase()) ||
          s.QR_code.toLowerCase().includes(search.toLowerCase()) ||
          s.user_name.toLowerCase().includes(search.toLowerCase()) ||
          s.parent_phone.includes(search);
        const matchesGrade = !gradeLevel || s.grade_level === gradeLevel;
        return matchesSearch && matchesGrade;
      })
      .map(s => {
        const { password, ...rest } = s;
        return {
          ...rest,
          enrolled_groups_count: store.student_groups.filter(sg => sg.student_id === s.student_ID).length
        };
      });
  },

  async findById(studentId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('student_ID', sql.Int, studentId)
        .query(`
          SELECT student_ID, full_Name, student_phone, parent_phone, grade_level, QR_code, user_name, created_At
          FROM students
          WHERE student_ID = @student_ID
        `);
      return result.recordset[0] || null;
    }
    const s = getMemoryStore().students.find(st => st.student_ID === Number(studentId));
    if (!s) return null;
    const { password, ...rest } = s;
    return rest;
  },

  async findByUsername(username) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('user_name', sql.VarChar(50), username)
        .query(`
          SELECT * 
          FROM students 
          WHERE user_name = @user_name
        `);
      return result.recordset[0] || null;
    }
    return getMemoryStore().students.find(s => s.user_name.toLowerCase() === username.toLowerCase()) || null;
  },

  async findByQRCode(qrCode) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('QR_code', sql.VarChar(100), qrCode)
        .query(`
          SELECT student_ID, full_Name, student_phone, parent_phone, grade_level, QR_code, user_name, created_At
          FROM students
          WHERE QR_code = @QR_code
        `);
      return result.recordset[0] || null;
    }
    const s = getMemoryStore().students.find(st => st.QR_code === qrCode);
    if (!s) return null;
    const { password, ...rest } = s;
    return rest;
  },

  async create({ full_Name, student_phone, parent_phone, grade_level, QR_code, user_name, password }) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('full_Name', sql.NVarChar(100), full_Name)
        .input('student_phone', sql.VarChar(15), student_phone || null)
        .input('parent_phone', sql.VarChar(15), parent_phone)
        .input('grade_level', sql.NVarChar(50), grade_level || null)
        .input('QR_code', sql.VarChar(100), QR_code)
        .input('user_name', sql.VarChar(50), user_name)
        .input('password', sql.VarChar(255), password)
        .query(`
          INSERT INTO students (full_Name, student_phone, parent_phone, grade_level, QR_code, user_name, password)
          OUTPUT INSERTED.student_ID, INSERTED.full_Name, INSERTED.student_phone, INSERTED.parent_phone, INSERTED.grade_level, INSERTED.QR_code, INSERTED.user_name, INSERTED.created_At
          VALUES (@full_Name, @student_phone, @parent_phone, @grade_level, @QR_code, @user_name, @password)
        `);
      return result.recordset[0];
    }
    const store = getMemoryStore();
    const newId = store.students.length ? Math.max(...store.students.map(s => s.student_ID)) + 1 : 1;
    const newStudent = {
      student_ID: newId,
      full_Name,
      student_phone,
      parent_phone,
      grade_level,
      QR_code,
      user_name,
      password,
      created_At: new Date()
    };
    store.students.push(newStudent);
    const { password: _, ...rest } = newStudent;
    return rest;
  },

  async update(studentId, { full_Name, student_phone, parent_phone, grade_level, QR_code, user_name, password }) {
    const pool = await getPool();
    if (pool) {
      const request = pool.request()
        .input('student_ID', sql.Int, studentId)
        .input('full_Name', sql.NVarChar(100), full_Name)
        .input('student_phone', sql.VarChar(15), student_phone || null)
        .input('parent_phone', sql.VarChar(15), parent_phone)
        .input('grade_level', sql.NVarChar(50), grade_level || null)
        .input('QR_code', sql.VarChar(100), QR_code)
        .input('user_name', sql.VarChar(50), user_name);

      let query = `
        UPDATE students
        SET full_Name = @full_Name,
            student_phone = @student_phone,
            parent_phone = @parent_phone,
            grade_level = @grade_level,
            QR_code = @QR_code,
            user_name = @user_name
      `;

      if (password) {
        request.input('password', sql.VarChar(255), password);
        query += `, password = @password`;
      }

      query += `
        OUTPUT INSERTED.student_ID, INSERTED.full_Name, INSERTED.student_phone, INSERTED.parent_phone, INSERTED.grade_level, INSERTED.QR_code, INSERTED.user_name, INSERTED.created_At
        WHERE student_ID = @student_ID
      `;

      const result = await request.query(query);
      return result.recordset[0] || null;
    }
    const store = getMemoryStore();
    const idx = store.students.findIndex(s => s.student_ID === Number(studentId));
    if (idx === -1) return null;
    store.students[idx] = {
      ...store.students[idx],
      full_Name,
      student_phone,
      parent_phone,
      grade_level,
      QR_code,
      user_name,
      ...(password ? { password } : {})
    };
    const { password: _, ...rest } = store.students[idx];
    return rest;
  },

  async delete(studentId) {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('student_ID', sql.Int, studentId)
        .query(`DELETE FROM students WHERE student_ID = @student_ID`);
      return true;
    }
    const store = getMemoryStore();
    const idx = store.students.findIndex(s => s.student_ID === Number(studentId));
    if (idx === -1) return false;
    store.students.splice(idx, 1);
    store.student_groups = store.student_groups.filter(sg => sg.student_id !== Number(studentId));
    store.attendance = store.attendance.filter(a => a.student_id !== Number(studentId));
    store.payments = store.payments.filter(p => p.student_id !== Number(studentId));
    return true;
  },

  async getEnrolledGroups(studentId) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('student_id', sql.Int, studentId)
        .query(`
          SELECT g.group_id, g.group_name, g.monthly_fee, g.is_active, 
                 t.full_name AS teacher_name, t.Subject, sg.enrollment_Date
          FROM student_groups sg
          INNER JOIN groups g ON sg.group_id = g.group_id
          LEFT JOIN teachers t ON g.teacher_id = t.teacher_id
          WHERE sg.student_id = @student_id
          ORDER BY g.group_name ASC
        `);
      return result.recordset;
    }
    const store = getMemoryStore();
    const enrollments = store.student_groups.filter(sg => sg.student_id === Number(studentId));
    return enrollments.map(e => {
      const grp = store.groups.find(g => g.group_id === e.group_id) || {};
      const teacher = store.teachers.find(t => t.teacher_id === grp.teacher_id) || {};
      return {
        group_id: grp.group_id,
        group_name: grp.group_name,
        monthly_fee: grp.monthly_fee,
        is_active: grp.is_active,
        teacher_name: teacher.full_name || 'N/A',
        Subject: teacher.Subject || 'N/A',
        enrollment_Date: e.enrollment_Date
      };
    });
  },

  async enrollInGroup(studentId, groupId) {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('student_id', sql.Int, studentId)
        .input('group_id', sql.Int, groupId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM student_groups WHERE student_id = @student_id AND group_id = @group_id)
          BEGIN
            INSERT INTO student_groups (student_id, group_id, enrollment_Date)
            VALUES (@student_id, @group_id, GETDATE())
          END
        `);
      return true;
    }
    const store = getMemoryStore();
    const exists = store.student_groups.some(sg => sg.student_id === Number(studentId) && sg.group_id === Number(groupId));
    if (!exists) {
      store.student_groups.push({
        student_id: Number(studentId),
        group_id: Number(groupId),
        enrollment_Date: new Date()
      });
    }
    return true;
  },

  async unenrollFromGroup(studentId, groupId) {
    const pool = await getPool();
    if (pool) {
      await pool.request()
        .input('student_id', sql.Int, studentId)
        .input('group_id', sql.Int, groupId)
        .query(`DELETE FROM student_groups WHERE student_id = @student_id AND group_id = @group_id`);
      return true;
    }
    const store = getMemoryStore();
    store.student_groups = store.student_groups.filter(sg => !(sg.student_id === Number(studentId) && sg.group_id === Number(groupId)));
    return true;
  }
};
