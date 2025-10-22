# ai-learning-platform
AI Learning Platform built with Vue 3 + Node.js + Prisma

## 环境变量与功能开关

本仓库提供示例环境文件以便开箱即用：

- `client/.env.example` → 复制为 `client/.env.local`
- `server/.env.example` → 复制为 `server/.env.local` 或 `server/.env`

当未配置任何 AI 密钥时，站点仍可正常访问；AI 相关功能默认关闭，不会阻断页面渲染。

客户端示例变量（节选）：

```
VITE_API_BASE=http://localhost:3000/api
VITE_ENABLE_DEEPSEEK=false
VITE_DEEPSEEK_API_BASE=https://api.deepseek.com/v1
# 不要在仓库中提交真实密钥
VITE_DEEPSEEK_API_KEY=
```

服务端示例变量（节选）：

```
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=replace-with-a-strong-secret
CORS_ORIGIN=http://localhost:5173

DEEPSEEK_API_KEY=
KIMI_API_KEY=
COZE_API_KEY=
```

## 首次启动指南（安装与开发运行）

### 1) 前置环境
- 推荐：Node.js 20+（LTS）与 npm 10+
- 数据库：内置 SQLite（无需单独安装）

### 2) 安装依赖（根目录执行）
```bash
# 一键安装（根、client、server）
npm run install:all

# 或者使用 npm7+ 的 workspace 安装（在根目录）：
npm install
```

### 3) 配置环境变量
- 复制示例文件：
  - `client/.env.example` → `client/.env.local`
  - `server/.env.example` → `server/.env.local`（或 `server/.env`）
- 至少确认以下关键项（保持与本 README 顶部一致）：
  - `VITE_API_BASE=http://localhost:3000/api`
  - `PORT=3000`
  - `DATABASE_URL=file:./prisma/dev.db`
  - `CORS_ORIGIN=http://localhost:5173`
  - 如需启用 AI 能力（DeepSeek/Kimi/Coze），请在 client 与 server 各自环境文件中填写对应的 API Key。

### 4) 初始化数据库（首次必做）
```bash
# 生成 Prisma 客户端并创建/迁移 SQLite 表结构
npm run db:setup

# 可选：导入示例数据
npm run db:seed
```

### 5) 启动开发环境（前后端并行）
```bash
npm run dev
```
- 前端默认地址：`http://localhost:5173`
- 后端默认地址：`http://localhost:3000`

### 常见问题（Windows）
- 安装 `sqlite3` 失败：请使用 Node.js 20 LTS（通常会使用预编译二进制，避免本地编译工具链需求）。
- 端口占用：调整 `client/.env.local` 中 Vite 端口或 `server/.env.local` 中 `PORT`。

### 其它脚本
```bash
# 仅启动前端/后端（从根目录）
npm run dev:client
npm run dev:server

# 构建
npm run build

# 打开 Prisma Studio（可视化数据管理）
npm run db:studio
```