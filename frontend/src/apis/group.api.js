import { apiClient } from './axios.client';

export const GroupAPI = {
  async getAll({ teacher_id = '', is_active = '' } = {}) {
    const params = new URLSearchParams();
    if (teacher_id) params.append('teacher_id', teacher_id);
    if (is_active !== '') params.append('is_active', is_active);
    const response = await apiClient.get(`/groups?${params.toString()}`);
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/groups/${id}`);
    return response.data.data;
  },

  async getStudents(id) {
    const response = await apiClient.get(`/groups/${id}/students`);
    return response.data.data;
  },

  async create(data) {
    const response = await apiClient.post('/groups', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/groups/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/groups/${id}`);
    return response.data;
  }
};
