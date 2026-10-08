import { apiClient } from './axios.client';

export const TeacherAPI = {
  async getAll() {
    const response = await apiClient.get('/teachers');
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/teachers/${id}`);
    return response.data.data;
  },

  async getTeacherGroups(id) {
    const response = await apiClient.get(`/teachers/${id}/groups`);
    return response.data.data;
  },

  async getMyGroups() {
    const response = await apiClient.get('/teachers/my-groups');
    return response.data.data;
  },

  async create(data) {
    const response = await apiClient.post('/teachers', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/teachers/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/teachers/${id}`);
    return response.data;
  }
};
