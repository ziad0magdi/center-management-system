import { apiClient } from './axios.client';

export const AuthAPI = {
  async login({ username, password, role }) {
    const response = await apiClient.post('/auth/login', { username, password, role });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
