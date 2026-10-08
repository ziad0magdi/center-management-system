import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { TeacherModel } from '../models/teacher.model.js';
import { StudentModel } from '../models/student.model.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'smart_center_super_secret_jwt_key_2026_educational_cms';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const AuthService = {
  async login({ username, password, role }) {
    if (!username || !password) {
      throw new Error('Please provide both username and password.');
    }

    const cleanUsername = username.trim();
    let authenticatedUser = null;
    let userRole = role ? role.toLowerCase() : null;

    // 1. Check Admin login
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if ((!userRole || userRole === 'admin') && cleanUsername.toLowerCase() === adminUser.toLowerCase()) {
      if (password === adminPass) {
        authenticatedUser = {
          id: 0,
          username: adminUser,
          full_name: process.env.ADMIN_NAME || 'Center Administrator',
          role: 'admin',
          phone: '+201000000000'
        };
        userRole = 'admin';
      }
    }

    // 2. Check Teacher login if not matched as admin
    if (!authenticatedUser && (!userRole || userRole === 'teacher')) {
      const teacher = await TeacherModel.findByUsername(cleanUsername);
      if (teacher) {
        const isMatch = await this._verifyPassword(password, teacher.password);
        if (isMatch) {
          authenticatedUser = {
            id: teacher.teacher_id,
            teacher_id: teacher.teacher_id,
            username: teacher.user_name,
            full_name: teacher.full_name,
            phone: teacher.phone,
            subject: teacher.Subject,
            role: 'teacher'
          };
          userRole = 'teacher';
        }
      }
    }

    // 3. Check Student login if not matched
    if (!authenticatedUser && (!userRole || userRole === 'student')) {
      const student = await StudentModel.findByUsername(cleanUsername);
      if (student) {
        const isMatch = await this._verifyPassword(password, student.password);
        if (isMatch) {
          authenticatedUser = {
            id: student.student_ID,
            student_id: student.student_ID,
            username: student.user_name,
            full_name: student.full_Name,
            phone: student.student_phone,
            parent_phone: student.parent_phone,
            grade_level: student.grade_level,
            qr_code: student.QR_code,
            role: 'student'
          };
          userRole = 'student';
        }
      }
    }

    if (!authenticatedUser) {
      throw new Error('Invalid username, password, or role selection.');
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        full_name: authenticatedUser.full_name,
        role: authenticatedUser.role,
        ...(authenticatedUser.role === 'teacher' ? { teacher_id: authenticatedUser.id } : {}),
        ...(authenticatedUser.role === 'student' ? { student_id: authenticatedUser.id, qr_code: authenticatedUser.qr_code } : {})
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: authenticatedUser
    };
  },

  async _verifyPassword(plainPassword, hashedPassword) {
    if (!hashedPassword) return false;
    // Support bcrypt hashes
    if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
      return bcrypt.compare(plainPassword, hashedPassword);
    }
    // Direct match fallback for initial seed
    return plainPassword === hashedPassword;
  },

  async getProfile(userPayload) {
    if (!userPayload) throw new Error('No user context found.');

    if (userPayload.role === 'admin') {
      return {
        id: 0,
        username: process.env.ADMIN_USERNAME || 'admin',
        full_name: process.env.ADMIN_NAME || 'Center Administrator',
        role: 'admin'
      };
    }

    if (userPayload.role === 'teacher') {
      const teacher = await TeacherModel.findById(userPayload.id || userPayload.teacher_id);
      if (!teacher) throw new Error('Teacher record not found.');
      return { ...teacher, role: 'teacher' };
    }

    if (userPayload.role === 'student') {
      const student = await StudentModel.findById(userPayload.id || userPayload.student_id);
      if (!student) throw new Error('Student record not found.');
      return { ...student, role: 'student' };
    }

    throw new Error('Unknown role context.');
  }
};
