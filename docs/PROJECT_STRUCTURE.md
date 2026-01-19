# 项目结构概览

本文档提供AI学习平台的目录结构概览和关键说明。详细的架构设计请参考：
- [前端架构](./FRONTEND_ARCHITECTURE.md)
- [后端架构](./BACKEND_ARCHITECTURE.md)

## 顶层结构

```
ai-learning-platform(vue)/
├── client/          # 前端：Vue 3 + Vite + TypeScript + Pinia
├── server/          # 后端：Express + Prisma + TypeScript
├── shared/          # 前后端共享的常量和类型定义
├── docs/            # 项目文档
└── scripts/         # 构建和部署脚本
```

## 前端结构 (client/)

```
client/
├── src/
│   ├── components/  # 可复用组件
│   │   └── common/ # 通用组件（Header、Sidebar、AiPanel等）
│   ├── pages/      # 页面组件
│   │   ├── agent/  # AI Agent页面（Tarot、MBTI等）
│   │   └── api/    # AI API页面（DeepSeek、Kimi等）
│   ├── services/   # 前端服务层（AI、搜索、用户等）
│   ├── stores/     # Pinia状态管理
│   ├── router/     # Vue Router配置
│   ├── types/      # TypeScript类型定义
│   └── utils/      # 工具函数
├── public/         # 静态资源
└── dist/          # 构建输出
```

## 后端结构 (server/)

```
server/
├── src/
│   ├── controllers/ # 控制器层
│   ├── routes/      # 路由定义
│   ├── services/    # 业务逻辑层
│   ├── middleware/  # 中间件（认证、日志等）
│   └── utils/       # 工具函数
├── prisma/
│   ├── schema.prisma # 数据模型定义
│   └── migrations/  # 数据库迁移记录
├── config/         # 配置文件
└── dist/          # 构建输出
```

## 关键约定

### 前端约定
- 路由 `meta.hideLeftSidebar` / `meta.hideRightSidebar` 控制侧边栏显示
- 统一从后端API获取数据，不依赖静态文件
- AI服务使用统一的接口抽象层

### 后端约定
- 所有数据库操作通过Prisma进行
- 统一的错误处理和响应格式
- JWT认证和权限控制

### 数据库约定
- 开发环境使用SQLite，生产环境使用PostgreSQL
- 通过Prisma管理数据库schema和迁移

## 开发工作流

1. **新增页面**：在 `client/src/pages/` 创建组件，在路由中注册
2. **新增API**：在 `server/src/` 添加对应的路由、控制器和服务
3. **数据模型变更**：修改 `prisma/schema.prisma`，生成迁移
4. **类型定义**：前后端共享的类型放在 `shared/` 目录

---

**提示**: 如需了解详细的架构设计和实现细节，请参考专门的架构文档。


