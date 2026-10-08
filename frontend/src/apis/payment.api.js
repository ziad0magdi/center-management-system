import { apiClient } from './axios.client';

export const PaymentAPI = {
  async recordPayment(data) {
    const response = await apiClient.post('/payments/record', data);
    return response.data;
  },

  async getMonthlyOverview({ month = '', year = '', student_id = '' } = {}) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    if (student_id) params.append('student_id', student_id);
    const response = await apiClient.get(`/payments/overview?${params.toString()}`);
    return response.data.data;
  },

  async getMyStatus({ month = '', year = '' } = {}) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await apiClient.get(`/payments/my-status?${params.toString()}`);
    return response.data.data;
  },

  async getMyPayments() {
    const response = await apiClient.get('/payments/my-payments');
    return response.data.data;
  },

  async getStudentPayments(studentId) {
    const response = await apiClient.get(`/payments/student/${studentId}`);
    return response.data.data;
  }
};
