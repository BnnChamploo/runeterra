import axios from 'axios';
import { getApiBaseUrl } from './config';

// 使用环境变量配置的 API URL
// 如果配置了完整 URL（生产环境），baseURL 就是完整 URL，所有请求路径需要包含 /api
// 如果没有配置（开发环境），baseURL 是 /api，请求路径不需要 /api 前缀
const API_BASE_URL = getApiBaseUrl();
const baseURL = API_BASE_URL || '/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：统一处理路径和添加token
api.interceptors.request.use(
  (config) => {
    // 如果 baseURL 是完整 URL（生产环境）且路径不以 /api 开头，自动添加
    if (API_BASE_URL && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
    }
    
    // 添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

