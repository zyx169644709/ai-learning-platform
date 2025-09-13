## 后端化改造摘要（从静态文件到 Prisma）

本文件概述了项目从“前端静态数据（JSON / TS）”迁移为“后端 API + 数据库（Prisma）”的过程、关键决策与影响。

### 背景
- 原始实现中，课程与资源数据存放在前端静态文件中，难以统一搜索、分页与更新。
- 迁移目标：统一数据源到数据库，提供标准化的后端 API，前端统一从后端获取数据，支持后续扩展（权限、统计、审计等）。

### 数据模型（Prisma）
主要模型：`User`、`Course`、`Resource`、`Discussion`、`Comment`、`UserPreferences`。

关键点：
- 删除了不再使用的 `CodeSnippet`、`LearningProgress` 等模型及其关联。
- `Course` 增加了 `cover String?` 字段，用于课程封面。

### 后端改造
- 新增/重构服务层：`server/src/services/*`，以 Prisma 代替文件读写。
- 控制器统一 `async/await`，避免直接返回 Promise 导致的响应格式错误。
- 统一 JWT 密钥读取：`process.env.JWT_SECRET || 'your-secret-key'`（经 `environment.ts` 聚合）。

### 前端改造
- `services/searchService.ts` 统一从后端拉取课程、资源、社区数据，移除对静态文件的依赖。
- `pages/Courses.vue`、`pages/Resources.vue` 改为 `onMounted` 调用 API 获取数据；删除难度/下载量等前端派生字段。
- 搜索结果跳转优化：外链 `target=_blank`，内链使用 `router.push`。

### AI Agents 与流式优化
- Coze（Tarot/MBTI）：处理 `delta` 与最终消息的“双流”模式，实现在服务层与页面层的去重合并与尾部替换策略。
- Kimi：实现 3 次/分钟的前端速率限制；代理配置使用 Vite devServer 代理。
- 建议问题提取：基于关键字、连续问句匹配、回溯问号等多策略提取，最多展示 3 条。

### 环境与配置
- 前端：`.env.local` 使用 `VITE_` 前缀；开发时需重启 `npm run dev` 生效。
- 后端：`.env` 管理 `DATABASE_URL`、`JWT_SECRET` 等；`config/environment.ts` 统一聚合，`config/database.ts` 暴露 `prisma`。

### 迁移收益
- 单一数据源、统一检索与分页、便于统计与权限拓展。
- 线上数据可通过 Prisma Studio 可视化管理。
- 前端打包体积减少，避免静态大数据重复传输。

### 影响评估与兼容
- 旧静态文件已删除；如需回退，可将数据导入数据库或临时改回文件读取（不推荐）。
- 新增 API 需在前端 `searchService.ts` 同步聚合，保持搜索一致性。

### 后续建议
- 引入分页与缓存（ETag/Last-Modified）。
- 增加审计日志与速率限制（后端层）。
- 将社区与用户偏好等模型补充索引与约束。


