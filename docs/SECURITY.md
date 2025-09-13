## 安全与配置指南

本文件聚焦环境变量管理、鉴权、CORS 与依赖安全等实践，适用于开发与生产环境。

### 1. 环境变量
- 前端（Vite）：
  - 使用 `.env.local`，变量必须以 `VITE_` 前缀暴露给浏览器，例如：
    - `VITE_COZE_BOT_ID`、`VITE_COZE_API_TOKEN`
    - `VITE_KIMI_API` 或 `VITE_KIMI_API_KEY`
  - 修改后需重启 `npm run dev`。
- 后端（Node）：
  - 使用 `server/.env`（不要提交到仓库）：
    - `JWT_SECRET=<强随机值>`
    - `DATABASE_URL=postgres://...`（生产）
  - `server/config/environment.ts` 会统一读取并校验。

### 2. 鉴权与 JWT
- 所有需要身份的接口使用 `authMiddleware` 验证 `Authorization: Bearer <token>`。
- `JWT_SECRET` 必须在生产环境提供且足够随机；有效期默认为 `7d`。

### 3. CORS 与代理
- 开发环境通过 Vite 代理避免跨域，例如：`/kimi-api` → Moonshot 官方地址。
- 生产环境在后端配置 `cors` 白名单，或在网关/反向代理层处理。

### 4. 依赖与构建
- 定期执行 `npm audit` 并升级高危依赖。
- 生产构建剔除开发用日志与调试开关；谨慎暴露错误堆栈。

### 5. 数据与权限
- 数据库账户分权：只给应用最小权限；生产使用只读副本进行报表更佳。
- 重要表加索引与约束，避免脏数据；删除操作尽量软删除（保留审计）。

### 6. 日志与监控
- 后端记录关键事件与错误日志（含请求 ID），便于追踪。
- 建议引入应用性能监控（APM）与健康检查端点。

### 7. 密钥轮换
- 所有密钥（JWT、API Key）应支持轮换：
  - 使用环境变量或密钥管理服务（如 Vault）。
  - 尽量减少在代码仓库出现明文密钥。


