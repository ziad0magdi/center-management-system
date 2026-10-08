import { apiClient } from './axios.client';

export const StudentAPI = {
  async getAll({ search = '', grade_level = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (grade_level) params.append('grade_level', grade_level);
    const response = await apiClient.get(`/students?${params.toString()}`);
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/students/${id}`);
    return response.data.data;
  },

  async getByQR(qrCode) {
    const response = await apiClient.get(`/students/qr/${encodeURIComponent(qrCode)}`);
    return response.data.data;
  },

  async create(data) {
    const response = await apiClient.post('/students', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  async getStudentGroups(id) {
    const response = await apiClient.get(`/students/${id}/groups`);
    return response.data.data;
  },

  async getMyGroups() {
    const response = await apiClient.get('/students/my-groups');
    return response.data.data;
  },

  async enroll(student_id, group_id) {
    const response = await apiClient.post('/students/enroll', { student_id, group_id });
    return response.data;
  },

  async unenroll(student_id, group_id) {
    const response = await apiClient.post('/students/unenroll', { student_id, group_id });
    return response.data;
  }
};
