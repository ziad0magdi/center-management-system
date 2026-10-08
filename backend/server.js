import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { sessionConfig } from './config/session.config.js';
import { getPool } from './config/db.config.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

// Import Route Handlers
import authRoutes from './routes/auth.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import groupRoutes from './routes/group.routes.js';
import sessionRoutes from './routes/session.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import studentNotesRoutes from './routes/student_notes.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. CORS Configuration with credentials
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body & Cookie Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Server-Side Session State Management
app.use(sessionConfig);

// 4. Health & Status Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Smart Educational Center Management API',
    timestamp: new Date().toISOString(),
    session_id: req.sessionID || null
  });
});

// 5. API Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/student-notes', studentNotesRoutes);

// 6. Error & 404 Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// 7. Start Server & Connect to SQL Server
app.listen(PORT, async () => {
  console.log(`🚀 Smart Center API Server is running on http://localhost:${PORT}`);
  try {
    await getPool();
  } catch (err) {
    console.warn('DB initialization notice:', err.message);
  }
});
