# AI学习平台 - 文档中心

欢迎来到AI学习平台的文档中心！这里包含了项目的完整技术文档，帮助开发者快速了解、部署和维护系统。

## 📚 文档目录

### 🚀 快速开始
- [项目概述](./PROJECT_OVERVIEW.md) - 项目简介、核心特性和技术架构
- [项目结构](./PROJECT_STRUCTURE.md) - 目录结构和职责说明

### 🏗️ 架构设计
- [前端架构](./FRONTEND_ARCHITECTURE.md) - Vue 3前端架构详细说明
- [后端架构](./BACKEND_ARCHITECTURE.md) - Node.js后端架构详细说明
- [数据库设计](./DATABASE_DESIGN.md) - 数据模型和数据库设计

### 🔌 API文档
- [API接口文档](./API_DOCUMENTATION.md) - 完整的RESTful API接口说明

### 🚀 部署运维
- [部署指南](./DEPLOYMENT_GUIDE.md) - 生产环境部署和运维指南

### � 历史文档
- [迁移记录](./HISTORY/) - 项目迁移历史记录（归档）

## 🎯 文档使用指南

### 新手入门
1. 首先阅读 [项目概述](./PROJECT_OVERVIEW.md) 了解项目整体情况
2. 查看 [项目结构](./PROJECT_STRUCTURE.md) 熟悉代码组织
3. 按照 [部署指南](./DEPLOYMENT_GUIDE.md) 快速搭建开发环境

### 开发参考
- 前端开发：参考 [前端架构](./FRONTEND_ARCHITECTURE.md) 了解组件设计和状态管理
- 后端开发：参考 [后端架构](./BACKEND_ARCHITECTURE.md) 了解API设计和服务层架构
- 数据库操作：参考 [数据库设计](./DATABASE_DESIGN.md) 了解数据模型和查询优化

### API集成
- 查看 [API接口文档](./API_DOCUMENTATION.md) 了解所有可用的API接口
- 包含完整的请求/响应示例和错误处理说明

### 运维部署
- 参考 [部署指南](./DEPLOYMENT_GUIDE.md) 进行生产环境部署
- 包含多种部署方案：传统服务器、Docker容器、云平台部署

## 🛠️ 技术栈总览

### 前端技术
- **框架**: Vue 3.5.18 + TypeScript 5.9.2
- **构建工具**: Vite 7.0.4
- **UI组件**: Element Plus 2.10.7
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.5.1
- **样式**: TailwindCSS 3.4.4
- **代码编辑器**: Monaco Editor 0.50.0

### 后端技术
- **运行时**: Node.js 20+ LTS
- **框架**: Express 5.1.0
- **语言**: TypeScript 5.9.2
- **数据库**: SQLite 3 (开发) / PostgreSQL 14+ (生产)
- **ORM**: Prisma 6.14.0
- **认证**: JWT 9.0.2
- **安全**: bcryptjs 3.0.2

### AI服务集成
- **DeepSeek**: 智能对话服务
- **Kimi**: 月之暗面AI服务
- **Coze**: 字节跳动AI服务

## 📊 项目特性

### 🤖 AI能力
- 多AI服务集成支持
- 流式响应处理
- 上下文管理
- 功能开关控制

### 📚 学习功能
- 课程管理系统
- 资源库管理
- 学习进度跟踪
- 个性化推荐

### 👥 社区功能
- 讨论区（技术/经验/项目/求助）
- 评论系统
- 用户主页
- 关注互动

### 🎨 用户体验
- 响应式设计
- 主题切换（明暗模式）
- 国际化支持
- 无障碍访问

## 🔧 开发环境要求

### 基础环境
- Node.js 20+ LTS
- npm 10+ 或 yarn 1.22+
- Git 2.30+

### 开发工具
- VS Code（推荐）
- Vue DevTools
- Prisma Studio
- Postman（API测试）

## 🚀 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/your-org/ai-learning-platform.git
cd ai-learning-platform

# 2. 安装依赖
npm run install:all

# 3. 配置环境变量
cp client/.env.example client/.env.local
cp server/.env.example server/.env
# 编辑环境变量文件

# 4. 初始化数据库
npm run db:setup

# 5. 启动开发服务
npm run dev
```

访问地址：
- 前端：http://localhost:5173
- 后端API：http://localhost:3000
- 数据库管理：http://localhost:5555 (Prisma Studio)

## 📈 性能指标

### 前端性能
- 首屏加载时间：< 2秒
- 交互响应时间：< 100ms
- 代码分割：按需加载
- 图片懒加载：提升页面性能

### 后端性能
- API响应时间：< 200ms
- 数据库查询：优化索引
- 缓存策略：Redis缓存
- 并发处理：支持1000+并发

### 系统可用性
- 服务可用性：99.9%
- 数据备份：每日自动备份
- 监控告警：实时监控
- 故障恢复：快速回滚

## 🤝 贡献指南

### 开发流程
1. Fork 项目到个人仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范
- 遵循 ESLint 配置
- 使用 TypeScript 严格模式
- 编写单元测试
- 更新相关文档

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📞 支持与反馈

### 问题反馈
- GitHub Issues：提交bug报告和功能请求
- 邮件联系：support@example.com
- 技术交流：加入开发者群组

### 文档维护
- 文档更新：定期更新技术文档
- 版本管理：跟随项目版本发布
- 社区贡献：欢迎提交文档改进建议

## 📄 许可证

本项目采用 [ISC](../LICENSE) 许可证，允许自由使用和修改。

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-06  
**维护团队**: AI Learning Platform Team

💡 **提示**: 建议先从 [项目概述](./PROJECT_OVERVIEW.md) 开始阅读，逐步深入了解各个模块的实现细节。


