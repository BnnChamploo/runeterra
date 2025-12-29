#!/bin/bash

# Fly.io 数据迁移脚本
# 使用方法：./migrate-data.sh

set -e  # 遇到错误立即退出

echo "🚀 开始迁移数据到 Fly.io..."

# 检查 fly 命令
if ! command -v fly &> /dev/null; then
    echo "❌ 错误：找不到 fly 命令"
    echo "请先安装 Fly.io CLI："
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# 检查数据包是否存在
DATA_PACKAGE="/tmp/runeterra-data.tar.gz"
if [ ! -f "$DATA_PACKAGE" ]; then
    echo "❌ 错误：找不到数据包 $DATA_PACKAGE"
    echo "请先运行打包命令："
    echo "cd server && tar -czf /tmp/runeterra-data.tar.gz runeterra.db uploads/"
    exit 1
fi

echo "✅ 数据包已找到：$DATA_PACKAGE ($(du -h "$DATA_PACKAGE" | cut -f1))"

# 检查应用状态
echo ""
echo "📋 检查应用状态..."
fly status

# 检查 Volume
echo ""
echo "📋 检查持久化存储..."
fly volumes list

# 确认是否继续
echo ""
read -p "是否继续上传数据？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

# 上传数据包
echo ""
echo "📤 上传数据包到 Fly.io..."
fly ssh sftp shell <<EOF
put $DATA_PACKAGE /tmp/runeterra-data.tar.gz
quit
EOF

# 解压数据
echo ""
echo "📦 解压数据到持久化存储..."
fly ssh console -C "cd /app/data && tar -xzf /tmp/runeterra-data.tar.gz && rm /tmp/runeterra-data.tar.gz && ls -lh"

# 设置权限
echo ""
echo "🔐 设置文件权限..."
fly ssh console -C "chmod 644 /app/data/runeterra.db && chmod -R 755 /app/data/uploads/"

echo ""
echo "✅ 数据迁移完成！"
echo ""
echo "📋 验证数据："
fly ssh console -C "ls -lh /app/data/ && echo '' && du -sh /app/data/*"

