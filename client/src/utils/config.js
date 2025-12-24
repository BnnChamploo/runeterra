// 统一配置管理
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || (API_BASE_URL ? `${API_BASE_URL}/uploads` : '/uploads');

// 获取上传文件的完整URL
export function getUploadUrl(path) {
  if (!path) return '';
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // 如果是相对路径，拼接基础URL
  return `${UPLOAD_BASE_URL}/${path}`;
}

// 获取API基础URL
export function getApiBaseUrl() {
  return API_BASE_URL || '';
}

export default {
  API_BASE_URL,
  UPLOAD_BASE_URL,
  getUploadUrl,
  getApiBaseUrl
};

