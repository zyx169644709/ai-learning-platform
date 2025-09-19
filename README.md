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
