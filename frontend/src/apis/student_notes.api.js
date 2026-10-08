import { apiClient } from './axios.client';

export const StudentNotesAPI = {
  async getSessionNote(sessionId) {
    const response = await apiClient.get(`/student-notes/session/${sessionId}`);
    return response.data.data;
  },

  async getMyNotes() {
    const response = await apiClient.get('/student-notes/my-notes');
    return response.data.data;
  },

  async saveNote({ session_id, personal_note, student_id = null }) {
    const response = await apiClient.post('/student-notes', {
      session_id,
      personal_note,
      student_id
    });
    return response.data;
  }
};
