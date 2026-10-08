import { AttendanceService } from '../services/attendance.service.js';

export const AttendanceController = {
  async markByQR(req, res, next) {
    try {
      const { session_id, qr_code } = req.body;
      const result = await AttendanceService.markByQRCode(session_id, qr_code);
      res.status(200).json({
        success: true,
        message: `Attendance marked for ${result.student?.full_Name || 'Student'}!`,
        data: result
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async mark(req, res, next) {
    try {
      const { session_id, student_id } = req.body;
      const result = await AttendanceService.markAttendance(session_id, student_id);
      res.status(200).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: result
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async getSessionAttendance(req, res, next) {
    try {
      const attendance = await AttendanceService.getSessionAttendance(req.params.sessionId);
      res.status(200).json({ success: true, data: attendance });
    } catch (err) {
      next(err);
    }
  },

  async getAbsentStudents(req, res, next) {
    try {
      const absentStudents = await AttendanceService.getAbsentStudents(req.params.sessionId);
      res.status(200).json({ success: true, data: absentStudents });
    } catch (err) {
      next(err);
    }
  },

  async sendAbsenceWhatsApp(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { custom_message, target_student_ids } = req.body;
      const teacherName = req.user ? req.user.full_name : 'Teacher';

      const result = await AttendanceService.sendAbsenceWhatsApp(sessionId, {
        customMessage: custom_message,
        targetStudentIds: target_student_ids,
        teacherName
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async delete(req, res, next) {
    try {
      const { sessionId, studentId } = req.params;
      const result = await AttendanceService.removeAttendance(sessionId, studentId);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
};
