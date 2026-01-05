# 🔧 前端 API 配置修复说明

## ❌ 问题

在 GitHub Pages (`https://BnnChamploo.github.io/runeterra`) 上：
- 刷新后没有帖子显示
- 无法登录（阿狸账号）

## 🔍 原因

**前端没有配置后端 API URL**，导致：
- 生产环境使用相对路径 `/api`
- 相对路径在 GitHub Pages 上指向 `https://BnnChamploo.github.io/api`（不存在）
- 而不是 Fly.io 后端 `https://runeterra-api.fly.dev`

## ✅ 修复

### 1. 前端配置更新

**文件：`client/src/utils/config.js`**

```javascript
// 生产环境默认使用 Fly.io 后端
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://runeterra-api.fly.dev' : '');
```

**说明：**
- 开发环境：使用相对路径 `/api`（Vite proxy）
- 生产环境：如果没有设置 `VITE_API_URL`，默认使用 `https://runeterra-api.fly.dev`

### 2. 后端 CORS 配置更新

**文件：`server/index.js`**

```javascript
// CORS 配置：允许 GitHub Pages 和本地开发
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.GITHUB_PAGES_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // 允许配置的域名
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      // 开发环境允许所有来源
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
```

**说明：**
- 明确允许 `https://BnnChamploo.github.io` 和 `https://BnnChamploo.github.io/runeterra`
- 允许本地开发环境（`localhost:3000`, `localhost:5173`）

## 📝 部署状态

✅ **代码已提交并推送到 GitHub**
- 提交信息：`修复前端API配置：生产环境默认使用Fly.io后端，更新后端CORS配置`
- GitHub Actions 会自动构建并部署到 GitHub Pages

## ⏱️ 等待部署

**GitHub Actions 部署通常需要 2-5 分钟**

你可以：
1. 访问 GitHub 仓库的 Actions 页面查看部署进度
2. 等待几分钟后刷新 `https://BnnChamploo.github.io/runeterra`
3. 检查浏览器控制台（F12）查看是否有 API 请求错误

## 🔍 验证

部署完成后，在浏览器控制台（F12）检查：
- Network 标签：API 请求应该指向 `https://runeterra-api.fly.dev/api/...`
- Console 标签：不应该有 CORS 错误

## 🎯 如果还有问题

1. **清除浏览器缓存**：`Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
2. **检查 GitHub Actions**：确认部署成功
3. **检查后端日志**：`fly logs -a runeterra-api`

---

**修复完成！等待 GitHub Actions 自动部署即可。**

