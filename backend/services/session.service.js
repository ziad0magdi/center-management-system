import { SessionModel } from '../models/session.model.js';
import { GroupModel } from '../models/group.model.js';

export const SessionService = {
  async getAllSessions(filter) {
    return SessionModel.findAll(filter);
  },

  async getSessionById(id) {
    const session = await SessionModel.findById(id);
    if (!session) {
      throw new Error(`Session with ID ${id} not found.`);
    }
    return session;
  },

  async createSession(data, user) {
    const { group_id, session_date, session_title, homework_notes, completed } = data;
    if (!group_id || !session_date || !session_title) {
      throw new Error('Group ID, Session Date, and Title are required.');
    }

    const group = await GroupModel.findById(group_id);
    if (!group) {
      throw new Error(`Group with ID ${group_id} does not exist.`);
    }

    // If teacher, ensure they own this group
    if (user && user.role === 'teacher' && group.teacher_id !== Number(user.id || user.teacher_id)) {
      throw new Error('You can only create sessions for groups assigned to you.');
    }

    return SessionModel.create({
      group_id,
      session_date,
      session_title,
      homework_notes: homework_notes || '',
      completed: completed || false
    });
  },

  async updateSession(id, data, user) {
    const session = await SessionModel.findById(id);
    if (!session) {
      throw new Error(`Session with ID ${id} not found.`);
    }

    if (user && user.role === 'teacher') {
      const group = await GroupModel.findById(session.group_id);
      if (group && group.teacher_id !== Number(user.id || user.teacher_id)) {
        throw new Error('You do not have permission to modify this session.');
      }
    }

    const { session_date, session_title, homework_notes, completed } = data;
    return SessionModel.update(id, {
      session_date: session_date || session.session_date,
      session_title: session_title || session.session_title,
      homework_notes: homework_notes !== undefined ? homework_notes : session.homework_notes,
      completed: completed !== undefined ? completed : session.completed
    });
  },

  async updateHomeworkNotes(id, homework_notes, user) {
    const session = await SessionModel.findById(id);
    if (!session) {
      throw new Error(`Session with ID ${id} not found.`);
    }

    if (user && user.role === 'teacher') {
      const group = await GroupModel.findById(session.group_id);
      if (group && group.teacher_id !== Number(user.id || user.teacher_id)) {
        throw new Error('You do not have permission to modify homework for this session.');
      }
    }

    return SessionModel.updateHomework(id, homework_notes || '');
  },

  async deleteSession(id, user) {
    const session = await SessionModel.findById(id);
    if (!session) {
      throw new Error(`Session with ID ${id} not found.`);
    }

    if (user && user.role === 'teacher') {
      const group = await GroupModel.findById(session.group_id);
      if (group && group.teacher_id !== Number(user.id || user.teacher_id)) {
        throw new Error('You do not have permission to delete this session.');
      }
    }

    const success = await SessionModel.delete(id);
    if (!success) {
      throw new Error(`Session with ID ${id} could not be deleted.`);
    }
    return { message: 'Session deleted successfully.' };
  }
};
