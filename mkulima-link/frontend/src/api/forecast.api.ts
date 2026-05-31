import apiClient from './client';

export const forecastApi = {
  get: (product: string, county?: string, days?: number) =>
    apiClient.get('/forecast', { params: { product, county, days } }),
  getInsights: (county?: string) => apiClient.get('/forecast/insights', { params: { county } }),
  getSaved: (params?: Record<string, unknown>) => apiClient.get('/forecast/saved', { params }),
};
