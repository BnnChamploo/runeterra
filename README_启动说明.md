# 项目启动说明

## 方法一：使用自动启动脚本（推荐）

这个脚本会自动切换到Node 18，然后启动前后端服务器：

```bash
cd 项目根目录
./start.sh
```

## 方法二：手动启动（如果已安装nvm）

1. 进入项目目录并切换到Node 18：
```bash
cd 项目根目录
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18  # 如果还没安装，先运行 nvm install 18
```

2. 启动后端（新终端窗口）：
```bash
cd server
node index.js
```

3. 启动前端（另一个新终端窗口）：
```bash
cd client
npm run dev
```

## 重要说明

- ✅ **不会影响其他项目**：使用nvm可以管理多个Node版本
- ✅ **项目专用配置**：项目根目录有`.nvmrc`文件，指定使用Node 18
- ✅ **系统默认不变**：你的系统默认Node版本（14.21.3）保持不变
- ✅ **自动切换**：进入项目目录时，nvm会自动读取`.nvmrc`并使用对应版本

## 访问地址

- 前端：http://localhost:3000
- 后端API：http://localhost:3001

## 停止服务器

如果使用启动脚本，按 `Ctrl+C` 即可停止。

如果手动启动，需要在对应的终端窗口按 `Ctrl+C`。

