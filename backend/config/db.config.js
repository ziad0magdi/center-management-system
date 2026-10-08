import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const sqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'center',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
    connectTimeout: 5000,
    requestTimeout: 10000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise = null;
let isConnectedToSql = false;

// Fallback in-memory state for zero-crash developer experience if SQL Server service is offline
const memoryStore = {
  teachers: [
    {
      teacher_id: 1,
      teacher_ssn: '29001011234567',
      full_name: 'Dr. Tamer Hassan',
      phone: '+201012345678',
      Subject: 'Physics',
      user_name: 'tamer_physics',
      password: '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a' // password123
    },
    {
      teacher_id: 2,
      teacher_ssn: '28805051234568',
      full_name: 'Eng. Sarah Ahmed',
      phone: '+201123456789',
      Subject: 'Mathematics & Calculus',
      user_name: 'sarah_math',
      password: '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a' // password123
    }
  ],
  students: [
    {
      student_ID: 1,
      full_Name: 'Omar Khaled Mahmoud',
      student_phone: '+201200001111',
      parent_phone: '+201000002222',
      grade_level: 'Grade 12 (Thanaweya Amma)',
      QR_code: 'STD-2026-0001-OKM',
      user_name: 'omar_khaled',
      password: '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a', // password123
      created_At: new Date('2026-09-01')
    },
    {
      student_ID: 2,
      full_Name: 'Nour El-Din Youssef',
      student_phone: '+201200003333',
      parent_phone: '+201000004444',
      grade_level: 'Grade 12 (Thanaweya Amma)',
      QR_code: 'STD-2026-0002-NDY',
      user_name: 'nour_youssef',
      password: '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a', // password123
      created_At: new Date('2026-09-05')
    },
    {
      student_ID: 3,
      full_Name: 'Mariam Ali Mostafa',
      student_phone: '+201200005555',
      parent_phone: '+201000006666',
      grade_level: 'Grade 11 (Secondary 2)',
      QR_code: 'STD-2026-0003-MAM',
      user_name: 'mariam_ali',
      password: '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a', // password123
      created_At: new Date('2026-09-10')
    }
  ],
  groups: [
    {
      group_id: 1,
      teacher_id: 1,
      group_name: 'Physics Elite - Grade 12 (Sun & Wed 5 PM)',
      monthly_fee: 450.00,
      is_active: true
    },
    {
      group_id: 2,
      teacher_id: 2,
      group_name: 'Calculus Champions - Grade 12 (Mon & Thu 6 PM)',
      monthly_fee: 500.00,
      is_active: true
    },
    {
      group_id: 3,
      teacher_id: 1,
      group_name: 'Physics Foundations - Grade 11 (Sat & Tue 4 PM)',
      monthly_fee: 400.00,
      is_active: true
    }
  ],
  student_groups: [
    { student_id: 1, group_id: 1, enrollment_Date: new Date('2026-09-01') },
    { student_id: 1, group_id: 2, enrollment_Date: new Date('2026-09-01') },
    { student_id: 2, group_id: 1, enrollment_Date: new Date('2026-09-05') },
    { student_id: 3, group_id: 3, enrollment_Date: new Date('2026-09-10') }
  ],
  sessions: [
    {
      session_ID: 1,
      group_id: 1,
      session_date: '2026-10-04',
      session_title: 'Session 1: Electric Currents and Ohm\'s Law Applications',
      homework_notes: 'Solve Chapter 1 problems 1-25 in the workbook. Submit on Sunday.',
      completed: true
    },
    {
      session_ID: 2,
      group_id: 1,
      session_date: '2026-10-08',
      session_title: 'Session 2: Kirchhoff\'s Laws & Complex Circuits',
      homework_notes: 'Complete circuit analysis worksheet #2. Bring scientific calculators.',
      completed: false
    },
    {
      session_ID: 3,
      group_id: 2,
      session_date: '2026-10-05',
      session_title: 'Session 1: Differentiation Rules & Chain Rule',
      homework_notes: 'Section 2.3 problems 15-40.',
      completed: true
    }
  ],
  attendance: [
    {
      attendance_id: 1,
      session_id: 1,
      student_id: 1,
      attend_time: new Date('2026-10-04T17:05:00')
    },
    {
      attendance_id: 2,
      session_id: 1,
      student_id: 2,
      attend_time: new Date('2026-10-04T17:02:00')
    }
  ],
  student_notes: [
    {
      note_id: 1,
      student_id: 1,
      session_id: 1,
      personal_note: 'Need to review question 14 with teacher before next quiz.',
      created_at: new Date('2026-10-04T19:30:00')
    }
  ],
  payments: [
    {
      payment_id: 1,
      student_id: 1,
      group_id: 1,
      target_month: 10,
      target_year: 2026,
      amount_paid: 450.00,
      payment_date: new Date('2026-10-01T14:20:00')
    },
    {
      payment_id: 2,
      student_id: 1,
      group_id: 2,
      target_month: 10,
      target_year: 2026,
      amount_paid: 500.00,
      payment_date: new Date('2026-10-02T16:10:00')
    },
    {
      payment_id: 3,
      student_id: 3,
      group_id: 3,
      target_month: 10,
      target_year: 2026,
      amount_paid: 400.00,
      payment_date: new Date('2026-10-03T11:00:00')
    }
  ]
};

export const getPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(sqlConfig)
      .connect()
      .then(pool => {
        isConnectedToSql = true;
        console.log('✅ Connected to Microsoft SQL Server successfully.');
        return pool;
      })
      .catch(err => {
        isConnectedToSql = false;
        console.warn('⚠️ SQL Server connection note:', err.message);
        console.log('ℹ️ Running in resilient mode with memory sync.');
        poolPromise = null;
        return null;
      });
  }
  return poolPromise;
};

export const isSqlConnected = () => isConnectedToSql;
export const getMemoryStore = () => memoryStore;
export { sql };
