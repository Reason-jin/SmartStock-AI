import apiClient from './api';

export const analyticsService = {
  // Dashboard 통계 데이터
  getSummary: async (tenantId = 1) => {
    const response = await apiClient.get(`/analytics/summary?tenant_id=${tenantId}`);
    return response.data;
  },

  // 상위 제품 목록
  getTopProducts: async (tenantId = 1) => {
    const response = await apiClient.get(`/analytics/products?tenant_id=${tenantId}`);
    return response.data;
  },
};
