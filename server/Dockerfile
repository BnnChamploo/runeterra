FROM node:18-slim

WORKDIR /app

# 安装构建工具和 sqlite3 开发库（用于编译原生模块）
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# 复制 package 文件
COPY package*.json ./

# 设置环境变量，强制从源码编译 sqlite3
ENV npm_config_build_from_source=true

# 安装依赖（跳过预编译脚本，避免使用预编译的二进制文件）
RUN npm install --production --ignore-scripts

# 完全删除 sqlite3，然后从源码重新安装
RUN rm -rf node_modules/sqlite3
RUN npm install sqlite3 --production --build-from-source

# 验证 sqlite3 是否编译成功（如果失败会中断构建）
RUN node -e "require('sqlite3')" || (echo "❌ sqlite3 编译失败！" && exit 1)

# 复制应用代码
COPY . .

# 创建数据目录（用于 SQLite 数据库和上传文件）
RUN mkdir -p /app/data /app/uploads

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "index.js"]

