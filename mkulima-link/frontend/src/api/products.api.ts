import apiClient from './client';

export interface ProductFilters {
  page?: number; limit?: number; county?: string; category?: string;
  minPrice?: number; maxPrice?: number; search?: string; status?: string;
  sort?: string; order?: string; organic?: boolean; farmerId?: string;
}

export const productsApi = {
  list: (filters?: ProductFilters) => apiClient.get('/products', { params: filters }),
  get: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: FormData) => apiClient.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => apiClient.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  updateStatus: (id: string, status: string) => apiClient.patch(`/products/${id}/status`, { status }),
  categories: () => apiClient.get('/products/categories'),
  featured: () => apiClient.get('/products/featured'),
};
