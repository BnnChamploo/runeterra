FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads/avatars uploads/posts

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "index.js"]

