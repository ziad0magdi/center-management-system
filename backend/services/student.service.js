import bcrypt from 'bcryptjs';
import { StudentModel } from '../models/student.model.js';

const generateQRCode = (fullName) => {
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join('')
    .slice(0, 4) || 'STD';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `STD-${year}-${randomNum}-${initials}`;
};

export const StudentService = {
  async getAllStudents(query) {
    return StudentModel.findAll(query);
  },

  async getStudentById(id) {
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new Error(`Student with ID ${id} not found.`);
    }
    return student;
  },

  async getStudentByQRCode(qrCode) {
    const student = await StudentModel.findByQRCode(qrCode);
    if (!student) {
      throw new Error(`No student found for QR code: ${qrCode}`);
    }
    return student;
  },

  async createStudent(data) {
    const { full_Name, student_phone, parent_phone, grade_level, user_name, password } = data;
    if (!full_Name || !parent_phone || !user_name || !password) {
      throw new Error('Full Name, Parent Phone, Username, and Password are required.');
    }

    const existingUsername = await StudentModel.findByUsername(user_name);
    if (existingUsername) {
      throw new Error(`Username '${user_name}' is already taken.`);
    }

    const qr_code = data.QR_code || generateQRCode(full_Name);
    const hashedPassword = await bcrypt.hash(password, 10);

    return StudentModel.create({
      full_Name,
      student_phone: student_phone || '',
      parent_phone,
      grade_level: grade_level || 'General',
      QR_code: qr_code,
      user_name,
      password: hashedPassword
    });
  },

  async updateStudent(id, data) {
    const { full_Name, student_phone, parent_phone, grade_level, QR_code, user_name, password } = data;
    if (!full_Name || !parent_phone || !user_name) {
      throw new Error('Full Name, Parent Phone, and Username are required.');
    }

    let hashedPassword = undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await StudentModel.update(id, {
      full_Name,
      student_phone: student_phone || '',
      parent_phone,
      grade_level: grade_level || '',
      QR_code: QR_code || generateQRCode(full_Name),
      user_name,
      ...(hashedPassword ? { password: hashedPassword } : {})
    });

    if (!updated) {
      throw new Error(`Student with ID ${id} could not be updated.`);
    }
    return updated;
  },

  async deleteStudent(id) {
    const success = await StudentModel.delete(id);
    if (!success) {
      throw new Error(`Student with ID ${id} not found.`);
    }
    return { message: 'Student deleted successfully.' };
  },

  async getStudentGroups(studentId) {
    return StudentModel.getEnrolledGroups(studentId);
  },

  async enrollStudent(studentId, groupId) {
    await StudentModel.enrollInGroup(studentId, groupId);
    return { message: 'Student enrolled in group successfully.' };
  },

  async unenrollStudent(studentId, groupId) {
    await StudentModel.unenrollFromGroup(studentId, groupId);
    return { message: 'Student removed from group successfully.' };
  }
};
