## 项目结构与职责说明

本文详细说明前后端目录结构、关键文件职责、约定与常见扩展方式。

### 顶层结构
```
ai-learning-platform(vue)/
├─ client/                 # 前端：Vue 3 + Vite + TS + Pinia
├─ server/                 # 后端：Express + Prisma
├─ shared/                 # 共享常量与类型（前后端都可引用）
└─ docs/                   # 项目文档
```

### client（前端）
```
client/
├─ index.html              # Vite 入口 HTML
├─ src/
│  ├─ main.ts              # Vue 应用入口
│  ├─ App.vue              # 根组件与布局框
│  ├─ assets/              # 图片与主题样式
│  │  ├─ images/
│  │  └─ styles/themes.css # 主题变量（light/dark）
│  ├─ components/
│  │  └─ common/           # 复用组件（Header、Sidebar、AiPanel 等）
│  ├─ content/             # 章节目录与 Markdown 内容
│  ├─ pages/               # 路由页面
│  │  ├─ agent/            # Tarot、MBTI 等 Agent 页面
│  │  └─ api/              # DeepSeek、Kimi 等 Agent 页面
│  ├─ router/index.ts      # 路由与布局 meta（隐藏左右侧边栏等）
│  ├─ services/            # 前端服务层（AI、搜索、用户等）
│  ├─ stores/              # Pinia 状态（用户信息、偏好）
│  └─ types/               # TS 声明与适配
├─ vite.config.ts          # Vite 配置与代理
├─ tsconfig.json           # TS 编译器配置
└─ package.json
```

关键约定：
- 路由 `meta.hideLeftSidebar` / `meta.hideRightSidebar` 控制两侧栏显示。
- 搜索页统一从后端 `/api/courses`、`/api/resources`、`/api/community` 聚合数据。
- AI 服务（如 Coze、Kimi）使用 `services/agent/*` 的统一接口；流式解析和去重逻辑集中于服务层。

### server（后端）
```
server/
├─ src/
│  ├─ controllers/         # 入参校验与业务编排
│  ├─ routes/              # Express 路由定义
│  ├─ services/            # 业务逻辑（调用 Prisma）
│  └─ middleware/          # 鉴权、日志等中间件
├─ prisma/
│  ├─ schema.prisma        # 数据模型定义（User、Course、Resource、Discussion、Comment）
│  └─ migrations/          # 迁移记录
├─ generated/prisma/       # Prisma 客户端构建产物
├─ config/
│  ├─ environment.ts       # 环境配置聚合（dev/prod/test）
│  └─ database.ts          # PrismaClient 单例导出
├─ server.ts               # 应用入口（Express 实例与路由挂载）
└─ package.json
```

关键约定：
- 所有数据库访问通过 `config/database.ts` 暴露的 `prisma` 实例进行。
- JWT 密钥统一读取 `environment.ts`（`JWT_SECRET`），控制器与中间件一致使用。
- 生产环境建议 PostgreSQL，开发/测试环境默认 SQLite。

### shared（共享）
```
shared/
├─ constants/api.ts        # 前后端共享的 API 路径或常量
└─ types/user.ts           # 共享类型声明
```

### 新增页面/服务指引
- 新页面：在 `pages/` 下创建文件，并在 `router/index.ts` 注册路由；按需设置 `meta` 控制侧边栏。
- 新服务：在 `services/` 新建模块，前端服务注意类型声明；后端服务调用 `prisma` 并封装为可复用的业务函数。
- 新数据表：修改 `server/prisma/schema.prisma`，`npx prisma migrate dev` 生成迁移；补充种子或管理接口。

### 代码风格与质量
- 保持显式类型、早返回、浅层逻辑；禁止“吞错”。
- 前端关注可读性与响应式性能；后端关注错误边界、输入校验、鉴权与日志。


