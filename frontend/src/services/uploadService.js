import apiClient from './api';
import axios from "axios";


export const uploadService = {
  uploadFile: async (file, tenantId = 1) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(
      `/upload/?tenant_id=${tenantId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteUpload: async (stored_filename) => {
    const api = axios.create({
      baseURL: "http://localhost:8000/api/v1", // FastAPI 서버 주소
    });
    const res = await api.delete(`/upload/${stored_filename}`);
    return res.data;
  },
  
  getUploadProfile: async (uploadJobId, tenantId = 1) => {
    const response = await apiClient.get(
      `/upload/${uploadJobId}`
    );
    return response.data;
  },

  getUploadList: async (tenantId = 1, skip = 0, limit = 10) => {
    const response = await apiClient.get(
      `/upload/?tenant_id=${tenantId}&skip=${skip}&limit=${limit}`
    );
    return response.data;
  },
  
  

};


