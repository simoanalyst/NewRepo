import apiClient from './client';

export const marketApi = {
  getPrices: (params?: Record<string, unknown>) => apiClient.get('/market/prices', { params }),
  getTrends: (params?: Record<string, unknown>) => apiClient.get('/market/prices/trends', { params }),
  getPricesByCounty: (product: string) => apiClient.get('/market/prices/counties', { params: { product } }),
  getInsights: (county?: string) => apiClient.get('/market/insights', { params: county ? { county } : {} }),
};
