import { apiClient } from './axios.client';

export const AttendanceAPI = {
  async scanQR({ session_id, qr_code }) {
    const response = await apiClient.post('/attendance/scan-qr', { session_id, qr_code });
    return response.data;
  },

  async mark({ session_id, student_id }) {
    const response = await apiClient.post('/attendance/mark', { session_id, student_id });
    return response.data;
  },

  async getSessionAttendance(sessionId) {
    const response = await apiClient.get(`/attendance/session/${sessionId}`);
    return response.data.data;
  },

  async getAbsentStudents(sessionId) {
    const response = await apiClient.get(`/attendance/session/${sessionId}/absent`);
    return response.data.data;
  },

  async sendAbsenceWhatsApp(sessionId, { custom_message = '', target_student_ids = null } = {}) {
    const response = await apiClient.post(`/attendance/session/${sessionId}/send-whatsapp`, {
      custom_message,
      target_student_ids
    });
    return response.data;
  },

  async delete(sessionId, studentId) {
    const response = await apiClient.delete(`/attendance/session/${sessionId}/student/${studentId}`);
    return response.data;
  }
};
