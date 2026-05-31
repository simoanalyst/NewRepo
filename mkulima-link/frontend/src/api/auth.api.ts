import apiClient from './client';

export interface RegisterData {
  phone: string; password: string; firstName: string; lastName: string;
  role: string; county: string; email?: string;
}

export interface LoginData { identifier: string; password: string; }

export const authApi = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  forgotPassword: (identifier: string) => apiClient.post('/auth/forgot-password', { identifier }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
  verifyPhone: (otp: string) => apiClient.post('/auth/verify-phone', { otp }),
  sendOtp: () => apiClient.post('/auth/send-otp'),
};
