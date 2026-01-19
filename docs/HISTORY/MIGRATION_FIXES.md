## 迁移问题与修复手册（Troubleshooting）

记录在项目后端化与 AI Agent 集成过程中遇到的问题、原因与最终修复方案，便于复现与快速定位。

### 1. Prisma EPERM / 文件占用
- 现象：`EPERM: operation not permitted, rename ...` 或 `npx prisma generate` 失败。
- 成因：Windows 下 Node 进程或编辑器锁定了 `generated/prisma` 目录。
- 处理：
  1) 结束进程：`taskkill /F /IM node.exe`
  2) 删除生成目录：`Remove-Item -Recurse -Force server\generated\prisma`
  3) 重新生成：`npx prisma generate`、`npx prisma db push` 或 `npx prisma migrate dev`

### 2. 非 ASCII 的 `—name`
- 现象：`Argument starts with non-ascii dash, this is probably invalid: —name`
- 成因：命令里使用了全角/长破折号。
- 处理：改为 ASCII 双短横线：`--name`。

### 3. Prisma Studio 显示表不存在
- 现象：打开 Studio 报 “Current request failed for model: Course null”。
- 成因：数据库与 schema 不一致。
- 处理：`npx prisma db push` 同步 schema；必要时 `npx prisma generate`。

### 4. `/api/resources` 返回 `{}`
- 成因：控制器未 `await` 服务 Promise，直接返回了 Promise。
- 修复：控制器与路由统一 `async/await`，`await resourceService.list()`。

### 5. 流式 AI 回复重复（Coze 双流）
- 成因：同时收到 `delta` 流片段与最终完整消息，页面重复拼接。
- 修复：
  - 服务层 `cozeService.ts` 维护 `accumulated` 与 `sentFinal`，只在最终消息到达时替换；
  - 页面层在追加时使用前缀/后缀判断：`if (full && chunk.startsWith(full)) replace; else if (!full.endsWith(chunk)) append;`。

### 6. 顶部空行与缩进不一致
- 修复：在合并后 `trim()`，并对每行 `replace(/^\s+/gm, '')` 去掉行首缩进。

### 7. 建议问题不出现或过早出现
- 成因：仅依赖“建议:”标识不稳定；或在流式过程中提前渲染。
- 修复：
  - 多策略提取：关键词、连续问句、问号回溯；
  - 仅在 `!isLoading` 后渲染建议问题；限制最多 3 条。

### 8. Kimi API Key 未识别 / CORS
- 成因：未使用 `VITE_` 前缀或未重启 dev server；跨域未代理。
- 修复：
  - 前端 `.env.local` 使用 `VITE_KIMI_API` 或 `VITE_KIMI_API_KEY`；
  - Vite 代理 `/kimi-api` 指向 Moonshot；`kimiService.ts` 使用代理基址。

### 9. 路由/导入路径错乱（重命名后遗留）
- 现象：TS 报 `TeachingAssistant.vue not found`。
- 修复：全局替换为 `pages/api/DeepSeek.vue`，重启 TS Server 与 Vite，清 `.vite` 缓存。


