import { StudentService } from '../services/student.service.js';

export const StudentController = {
  async getAll(req, res, next) {
    try {
      const { search, grade_level } = req.query;
      const students = await StudentService.getAllStudents({ search, gradeLevel: grade_level });
      res.status(200).json({ success: true, data: students });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const student = await StudentService.getStudentById(req.params.id);
      res.status(200).json({ success: true, data: student });
    } catch (err) {
      next(err);
    }
  },

  async getByQR(req, res, next) {
    try {
      const student = await StudentService.getStudentByQRCode(req.params.qrCode);
      res.status(200).json({ success: true, data: student });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  },

  async create(req, res, next) {
    try {
      const created = await StudentService.createStudent(req.body);
      res.status(201).json({ success: true, message: 'Student registered successfully', data: created });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req, res, next) {
    try {
      const updated = await StudentService.updateStudent(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Student updated successfully', data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async delete(req, res, next) {
    try {
      const result = await StudentService.deleteStudent(req.params.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getStudentGroups(req, res, next) {
    try {
      const groups = await StudentService.getStudentGroups(req.params.id);
      res.status(200).json({ success: true, data: groups });
    } catch (err) {
      next(err);
    }
  },

  async getMyGroups(req, res, next) {
    try {
      const studentId = req.user.id || req.user.student_id;
      const groups = await StudentService.getStudentGroups(studentId);
      res.status(200).json({ success: true, data: groups });
    } catch (err) {
      next(err);
    }
  },

  async enroll(req, res, next) {
    try {
      const { student_id, group_id } = req.body;
      const result = await StudentService.enrollStudent(student_id, group_id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async unenroll(req, res, next) {
    try {
      const { student_id, group_id } = req.body;
      const result = await StudentService.unenrollStudent(student_id, group_id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
};
