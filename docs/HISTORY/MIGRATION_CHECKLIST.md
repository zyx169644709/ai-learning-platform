## 迁移检查清单（开发与回滚自检）

此清单用于在“静态数据 → 后端化（Prisma）”过程中自检，亦可在回滚/重做时复用。

### 一、数据库与 Prisma
- [ ] `server/prisma/schema.prisma` 已包含 `Course`、`Resource`、`Discussion`、`Comment`、`User`、`UserPreferences` 等模型
- [ ] 运行 `npx prisma generate` 成功
- [ ] 运行 `npx prisma db push` 或 `npx prisma migrate dev --name <name>` 成功
- [ ] `npx prisma studio` 可查看到表结构
- [ ] 若已有数据，确认能在 Studio 中正常显示

### 二、后端 API
- [ ] 路由文件 `server/src/routes/*` 存在并导出课程、资源、社区相关接口
- [ ] 控制器 `server/src/controllers/*` 使用 `async/await`，无直接返回 Promise 导致响应错误
- [ ] 服务层 `server/src/services/*` 调用 `prisma`，无文件读写遗留
- [ ] JWT：`authMiddleware` 正常校验、`JWT_SECRET` 统一来源（`environment.ts`）

### 三、前端改造
- [ ] `client/src/services/searchService.ts` 只从后端拉取数据，已移除静态导入
- [ ] `pages/Courses.vue`、`pages/Resources.vue` 改为 `onMounted` 调用 API
- [ ] 搜索结果外链使用 `window.open(url, '_blank')`，内链使用 `router.push`
- [ ] 路由 `meta.hideLeftSidebar/right` 控制布局正常

### 四、AI Agents（流式与建议问题）
- [ ] Coze/Kimi 服务读取环境变量正确（前端 `.env.local` 带 `VITE_` 前缀）
- [ ] 流式回复去重策略生效：前端 UI 不出现重复内容
- [ ] 建议问题在完成后渲染（`!isLoading` 时渲染）
- [ ] Kimi 速率限制（3 次/分钟）可触发提示

### 五、环境与代理
- [ ] 前端：`.env.local` 中的 `VITE_*` 已配置，并重启 `npm run dev`
- [ ] 后端：`.env` 中配置 `JWT_SECRET`、`DATABASE_URL`（生产）
- [ ] Vite 代理配置指向正确后端路径（如 `/kimi-api` → Moonshot 代理）

### 六、UI 与主题
- [ ] `themes.css` 主题变量可用；`body.no-scroll` 控制在 Agent 页面添加/移除
- [ ] 右侧 `AiPanel` 与左侧 `Sidebar` 随路由显示/隐藏

### 七、清理与一致性
- [ ] 删除未使用的静态数据文件与重复配置（如 `server/config/database.js`）
- [ ] Prisma 生成目录中无残留 `.tmp*` 文件
- [ ] 统一 import 路径（DeepSeek 从 `pages/DeepSeek` → `pages/api`）

### 八、回归测试建议
- [ ] 课程/资源列表页加载成功，点击资源可正确跳转（外链新标签、内链 `router.push`）
- [ ] 社区发帖与评论鉴权通过（无 401）
- [ ] Tarot 与 MBTI 流式输出不重复，建议问题在结束后出现
- [ ] Kimi 页正常显示欢迎提示与示例问题，API Key 配置正确


