import { StudentNotesModel } from '../models/student_notes.model.js';
import { SessionModel } from '../models/session.model.js';

export const StudentNotesService = {
  async getSessionNote(studentId, sessionId) {
    if (!studentId || !sessionId) {
      throw new Error('Student ID and Session ID are required.');
    }
    return StudentNotesModel.getByStudentAndSession(studentId, sessionId);
  },

  async getAllNotes(studentId) {
    if (!studentId) {
      throw new Error('Student ID is required.');
    }
    return StudentNotesModel.getAllForStudent(studentId);
  },

  async saveNote({ student_id, session_id, personal_note }) {
    if (!student_id || !session_id) {
      throw new Error('Student ID and Session ID are required.');
    }

    const session = await SessionModel.findById(session_id);
    if (!session) {
      throw new Error(`Session with ID ${session_id} not found.`);
    }

    return StudentNotesModel.upsert({
      student_id: Number(student_id),
      session_id: Number(session_id),
      personal_note: personal_note || ''
    });
  }
};
