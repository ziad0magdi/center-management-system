import { SessionService } from '../services/session.service.js';

export const SessionController = {
  async getAll(req, res, next) {
    try {
      const { group_id, teacher_id, student_id } = req.query;
      const user = req.user;

      let effectiveTeacherId = teacher_id;
      let effectiveStudentId = student_id;

      // Restrict teachers to their own sessions if not explicitly specified
      if (user && user.role === 'teacher' && !effectiveTeacherId) {
        effectiveTeacherId = user.id || user.teacher_id;
      }

      // Restrict students to their enrolled sessions
      if (user && user.role === 'student') {
        effectiveStudentId = user.id || user.student_id;
      }

      const sessions = await SessionService.getAllSessions({
        groupId: group_id,
        teacherId: effectiveTeacherId,
        studentId: effectiveStudentId
      });

      res.status(200).json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const session = await SessionService.getSessionById(req.params.id);
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await SessionService.createSession(req.body, req.user);
      res.status(201).json({ success: true, message: 'Session created successfully', data: created });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req, res, next) {
    try {
      const updated = await SessionService.updateSession(req.params.id, req.body, req.user);
      res.status(200).json({ success: true, message: 'Session updated successfully', data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateHomework(req, res, next) {
    try {
      const { homework_notes } = req.body;
      const updated = await SessionService.updateHomeworkNotes(req.params.id, homework_notes, req.user);
      res.status(200).json({ success: true, message: 'Homework notes updated successfully', data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async delete(req, res, next) {
    try {
      const result = await SessionService.deleteSession(req.params.id, req.user);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
};
