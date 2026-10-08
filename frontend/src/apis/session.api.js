import { apiClient } from './axios.client';

export const SessionAPI = {
  async getAll({ group_id = '', teacher_id = '', student_id = '' } = {}) {
    const params = new URLSearchParams();
    if (group_id) params.append('group_id', group_id);
    if (teacher_id) params.append('teacher_id', teacher_id);
    if (student_id) params.append('student_id', student_id);
    const response = await apiClient.get(`/sessions?${params.toString()}`);
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data.data;
  },

  async create(data) {
    const response = await apiClient.post('/sessions', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/sessions/${id}`, data);
    return response.data;
  },

  async updateHomework(id, homework_notes) {
    const response = await apiClient.patch(`/sessions/${id}/homework`, { homework_notes });
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/sessions/${id}`);
    return response.data;
  }
};
