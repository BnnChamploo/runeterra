// 统一配置管理
// 生产环境默认使用 Fly.io 后端
// 判断是否为生产环境：
// 1. Vite 构建时 import.meta.env.PROD 为 true
// 2. 运行时检查是否是 GitHub Pages 域名
const isProduction = import.meta.env.PROD || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'bnnchamploo.github.io' || 
    window.location.hostname.includes('github.io')));

// 生产环境强制使用 Fly.io 后端
// 如果明确设置了 VITE_API_URL，使用它；否则在生产环境使用 Fly.io
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://runeterra-api.fly.dev' : 
   (typeof window !== 'undefined' && 
    (window.location.hostname === 'bnnchamploo.github.io' || 
     window.location.hostname.includes('github.io')) 
    ? 'https://runeterra-api.fly.dev' : ''));
const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || 
  (API_BASE_URL ? `${API_BASE_URL}/uploads` : '/uploads');

// 调试信息（仅在开发环境）
if (!import.meta.env.PROD) {
  console.log('API配置:', { isProduction, API_BASE_URL, hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A' });
}

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

// 获取完整的API URL（用于 fetch 调用）
export function getApiUrl(path) {
  const base = getApiBaseUrl();
  // 如果 path 已经以 /api 开头，直接拼接
  if (path.startsWith('/api')) {
    return base ? `${base}${path}` : path;
  }
  // 否则添加 /api 前缀
  const apiPath = path.startsWith('/') ? `/api${path}` : `/api/${path}`;
  return base ? `${base}${apiPath}` : apiPath;
}

export default {
  API_BASE_URL,
  UPLOAD_BASE_URL,
  getUploadUrl,
  getApiBaseUrl,
  getApiUrl
};

