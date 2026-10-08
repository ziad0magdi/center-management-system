import { TeacherService } from '../services/teacher.service.js';

export const TeacherController = {
  async getAll(req, res, next) {
    try {
      const teachers = await TeacherService.getAllTeachers();
      res.status(200).json({ success: true, data: teachers });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const teacher = await TeacherService.getTeacherById(req.params.id);
      res.status(200).json({ success: true, data: teacher });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await TeacherService.createTeacher(req.body);
      res.status(201).json({ success: true, message: 'Teacher created successfully', data: created });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req, res, next) {
    try {
      const updated = await TeacherService.updateTeacher(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Teacher updated successfully', data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async delete(req, res, next) {
    try {
      const result = await TeacherService.deleteTeacher(req.params.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getMyGroups(req, res, next) {
    try {
      const teacherId = req.user.id || req.user.teacher_id;
      const groups = await TeacherService.getTeacherGroups(teacherId);
      res.status(200).json({ success: true, data: groups });
    } catch (err) {
      next(err);
    }
  },

  async getTeacherGroups(req, res, next) {
    try {
      const groups = await TeacherService.getTeacherGroups(req.params.id);
      res.status(200).json({ success: true, data: groups });
    } catch (err) {
      next(err);
    }
  }
};
