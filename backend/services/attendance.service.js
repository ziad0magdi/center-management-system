import { AttendanceModel } from '../models/attendance.model.js';
import { SessionModel } from '../models/session.model.js';
import { StudentModel } from '../models/student.model.js';
import { WhatsAppService } from './whatsapp.service.js';

export const AttendanceService = {
  async markByQRCode(sessionId, qrCode) {
    if (!sessionId || !qrCode) {
      throw new Error('Session ID and QR Code are required.');
    }
    return AttendanceModel.markAttendanceByQR(sessionId, qrCode.trim());
  },

  async markAttendance(sessionId, studentId) {
    if (!sessionId || !studentId) {
      throw new Error('Session ID and Student ID are required.');
    }
    return AttendanceModel.markAttendance(sessionId, studentId);
  },

  async getSessionAttendance(sessionId) {
    if (!sessionId) throw new Error('Session ID is required.');
    return AttendanceModel.getSessionAttendance(sessionId);
  },

  async getAbsentStudents(sessionId) {
    if (!sessionId) throw new Error('Session ID is required.');
    return AttendanceModel.getAbsentStudents(sessionId);
  },

  async sendAbsenceWhatsApp(sessionId, { customMessage = '', targetStudentIds = null, teacherName = 'Teacher' } = {}) {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found.`);
    }

    let absentStudents = await AttendanceModel.getAbsentStudents(sessionId);

    if (targetStudentIds && Array.isArray(targetStudentIds) && targetStudentIds.length > 0) {
      const idSet = new Set(targetStudentIds.map(Number));
      absentStudents = absentStudents.filter(s => idSet.has(Number(s.student_ID)));
    }

    if (absentStudents.length === 0) {
      return {
        message: 'No absent students found to notify for this session.',
        total_sent: 0,
        notifications: []
      };
    }

    const dispatchResult = await WhatsAppService.sendBulkAbsenceNotifications({
      absentStudents,
      session,
      teacherName: teacherName || session.teacher_name || 'Teacher',
      customMessage
    });

    return {
      message: `Successfully dispatched WhatsApp absence alerts to ${dispatchResult.total_sent} parent(s).`,
      ...dispatchResult
    };
  },

  async removeAttendance(sessionId, studentId) {
    const success = await AttendanceModel.removeAttendance(sessionId, studentId);
    return { message: 'Attendance record removed successfully.', success };
  }
};
