import bcrypt from 'bcryptjs';
import { TeacherModel } from '../models/teacher.model.js';

export const TeacherService = {
  async getAllTeachers() {
    return TeacherModel.findAll();
  },

  async getTeacherById(id) {
    const teacher = await TeacherModel.findById(id);
    if (!teacher) {
      throw new Error(`Teacher with ID ${id} not found.`);
    }
    return teacher;
  },

  async createTeacher(data) {
    const { teacher_ssn, full_name, phone, Subject, user_name, password } = data;
    if (!full_name || !phone || !Subject || !user_name || !password) {
      throw new Error('Please fill in all required teacher fields.');
    }

    const existing = await TeacherModel.findByUsername(user_name);
    if (existing) {
      throw new Error(`Username '${user_name}' is already taken by another teacher.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return TeacherModel.create({
      teacher_ssn: teacher_ssn || '',
      full_name,
      phone,
      Subject,
      user_name,
      password: hashedPassword
    });
  },

  async updateTeacher(id, data) {
    const { teacher_ssn, full_name, phone, Subject, user_name, password } = data;
    if (!full_name || !phone || !Subject || !user_name) {
      throw new Error('Please fill in all required fields.');
    }

    let hashedPassword = undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await TeacherModel.update(id, {
      teacher_ssn: teacher_ssn || '',
      full_name,
      phone,
      Subject,
      user_name,
      ...(hashedPassword ? { password: hashedPassword } : {})
    });

    if (!updated) {
      throw new Error(`Teacher with ID ${id} could not be updated or was not found.`);
    }
    return updated;
  },

  async deleteTeacher(id) {
    const success = await TeacherModel.delete(id);
    if (!success) {
      throw new Error(`Teacher with ID ${id} not found.`);
    }
    return { message: 'Teacher deleted successfully.' };
  },

  async getTeacherGroups(teacherId) {
    return TeacherModel.getGroups(teacherId);
  }
};
