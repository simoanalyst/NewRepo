import apiClient from './client';

export const ordersApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/orders', { params }),
  get: (id: string) => apiClient.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/orders', data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/orders/${id}/status`, { status }),
  cancel: (id: string, reason?: string) => apiClient.post(`/orders/${id}/cancel`, { reason }),
  review: (id: string, data: Record<string, unknown>) => apiClient.post(`/orders/${id}/review`, data),
};
