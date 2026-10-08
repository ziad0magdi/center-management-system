import { StudentNotesService } from '../services/student_notes.service.js';

export const StudentNotesController = {
  async getSessionNote(req, res, next) {
    try {
      const studentId = req.user ? (req.user.id || req.user.student_id) : req.params.studentId;
      const { sessionId } = req.params;
      const note = await StudentNotesService.getSessionNote(studentId, sessionId);
      res.status(200).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  },

  async getAllMyNotes(req, res, next) {
    try {
      const studentId = req.user.id || req.user.student_id;
      const notes = await StudentNotesService.getAllNotes(studentId);
      res.status(200).json({ success: true, data: notes });
    } catch (err) {
      next(err);
    }
  },

  async saveNote(req, res, next) {
    try {
      const studentId = req.user ? (req.user.id || req.user.student_id) : req.body.student_id;
      const { session_id, personal_note } = req.body;
      const savedNote = await StudentNotesService.saveNote({
        student_id: studentId,
        session_id,
        personal_note
      });
      res.status(200).json({
        success: true,
        message: 'Personal note saved successfully',
        data: savedNote
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
};
