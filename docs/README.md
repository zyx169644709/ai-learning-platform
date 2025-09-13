## AI Learning Platform（Vue + Node/Express + Prisma）

本项目是一个前后端分离的 AI 学习平台，前端采用 Vue 3 + Vite + TypeScript + Pinia，后端采用 Node.js + Express + Prisma（SQLite 开发环境，支持 PostgreSQL 生产环境）。项目内置课程与资源的数据库化管理、社区讨论与评论、以及多种 AI Agent（DeepSeek 助教、Tarot、MBTI、Kimi）聊天功能。

### 功能概览
- **课程与资源**：通过后端 API 提供列表与详情，数据来源为 Prisma 数据库。
- **搜索**：前端统一聚合 `/api/courses`、`/api/resources`、`/api/community` 返回的数据。
- **社区**：讨论与评论，采用 JWT 鉴权。
- **AI Agents**：Tarot、MBTI、DeepSeek 助教、Kimi。支持流式回复、去重、建议问题提取、速率限制（Kimi）。
- **主题与布局**：左/右侧边栏可按路由显示/隐藏，使用 CSS 变量进行主题适配。

### 目录结构（摘要）
```
client/                # 前端（Vue 3 + Vite）
server/                # 后端（Express + Prisma）
shared/                # 前后端共享类型与常量
docs/                  # 项目文档（当前文件）
```

完整结构与职责见《PROJECT_STRUCTURE.md》。

### 快速开始（开发环境）
1. 安装依赖（项目根与 server、client 各自安装）：
   - 根目录：`npm i`（可选）
   - `server/`：`npm i`
   - `client/`：`npm i`
2. 数据库准备（SQLite 开发）：
   - `cd server`
   - `npx prisma generate`
   - `npx prisma db push`（或 `npx prisma migrate dev`）
   - `npm run seed`（如有脚本，用于插入初始课程与资源）
3. 启动服务：
   - 后端：`cd server && npm run dev`
   - 前端：`cd client && npm run dev`
4. 访问：
   - 前端：`http://localhost:5173`
   - 后端 API：`http://localhost:3000`

### 环境变量
- 前端 `.env.local`：以 `VITE_` 前缀暴露给客户端，例如 `VITE_COZE_BOT_ID`、`VITE_KIMI_API_KEY`。
- 后端 `.env`：`DATABASE_URL`（生产）、`JWT_SECRET` 等。
- 详见《SECURITY.md》。

### 常见命令
- 生成 Prisma 客户端：`npx prisma generate`
- 推送 schema 到数据库：`npx prisma db push`
- 迁移（开发）：`npx prisma migrate dev --name <name>`
- 打开 Prisma Studio：`npx prisma studio`

### 开发规范与注意事项
- TypeScript 严格模式；公共 API、store、服务均需类型声明。
- 组件与页面遵循浅层嵌套与早返回原则，避免深层逻辑嵌套。
- 流式 AI 回复需使用已实现的去重合并策略，避免重复输出。
- 重要变更需同步更新本 `docs/` 文档。

### 进一步阅读
- 《PROJECT_STRUCTURE.md》：代码目录与职责
- 《MIGRATION_SUMMARY.md》：从静态数据到后端化的整体改造说明
- 《MIGRATION_CHECKLIST.md》：改造/回滚时的核对清单
- 《MIGRATION_FIXES.md》：问题与修复手册
- 《SECURITY.md》：安全与配置


