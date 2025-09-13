# AI Learning Platform - Server

基于 Prisma ORM 的 AI 学习平台后端服务，支持 SQLite（开发环境）和 PostgreSQL（生产环境）。

## 🚀 特性

- **多环境数据库支持**：开发环境使用 SQLite，生产环境使用 PostgreSQL
- **Prisma ORM**：类型安全的数据库操作，自动生成 TypeScript 类型
- **用户管理系统**：完整的用户注册、登录、权限管理
- **代码片段管理**：支持多种编程语言的代码存储和分享
- **学习进度跟踪**：记录用户的学习进度和完成状态
- **用户偏好设置**：主题、代码编辑器配置等个性化设置

## 🛠️ 技术栈

- **Node.js** + **Express.js**
- **Prisma ORM** - 数据库操作
- **SQLite** - 开发环境数据库
- **PostgreSQL** - 生产环境数据库
- **JWT** - 用户认证
- **bcryptjs** - 密码加密

## 📋 环境要求

- Node.js 18+
- npm 或 yarn
- SQLite 3（开发环境）
- PostgreSQL 15+（生产环境）

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

#### 开发环境

创建 `.env` 文件：

```env
# 开发环境 SQLite 配置
DATABASE_URL="file:./dev.db"
NODE_ENV=development
JWT_SECRET=dev_jwt_secret_here
PORT=3000
```

#### 生产环境

创建 `.env` 文件：

```env
# 生产环境 PostgreSQL 配置
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### 3. 数据库设置

#### 开发环境

```bash
# 生成 Prisma 客户端
npm run db:generate

# 同步数据库结构
npm run db:push

# 初始化测试数据
npm run db:seed
```

#### 生产环境

```bash
# 生成 Prisma 客户端
npm run db:generate

# 部署数据库迁移
npm run db:migrate:deploy
```

### 4. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## 📊 数据库模型

### User（用户）
- 基本信息：用户名、邮箱、密码、头像、角色
- 关联：代码片段、学习进度、用户偏好

### CodeSnippet（代码片段）
- 内容：标题、代码内容、编程语言、描述
- 权限：公开/私有设置
- 关联：所属用户

### LearningProgress（学习进度）
- 进度：章节ID、完成状态、完成时间
- 关联：用户

### UserPreferences（用户偏好）
- 设置：主题、代码面板比例、编程语言、通知设置
- 关联：用户

## 🔧 可用脚本

```bash
# 数据库相关
npm run db:generate          # 生成 Prisma 客户端
npm run db:push             # 同步数据库结构
npm run db:migrate          # 创建开发环境迁移
npm run db:migrate:deploy   # 部署生产环境迁移
npm run db:migrate:reset    # 重置数据库
npm run db:migrate:status   # 查看迁移状态
npm run db:seed             # 初始化测试数据
npm run db:studio           # 打开 Prisma Studio

# 数据库设置
npm run db:setup            # 开发环境完整设置
npm run db:setup:prod       # 生产环境完整设置

# 服务相关
npm run dev                 # 开发模式启动
npm start                   # 生产模式启动
```

## 🌍 环境配置

### 开发环境 (development)
- 数据库：SQLite
- 日志：详细查询日志
- 端口：3000
- 主机：localhost

### 生产环境 (production)
- 数据库：PostgreSQL
- 日志：仅错误和警告
- 端口：环境变量 PORT
- 主机：0.0.0.0

### 测试环境 (test)
- 数据库：SQLite (test.db)
- 端口：3001
- 用于单元测试

## 🚀 部署指南

### 1. 选择 PostgreSQL 服务

推荐免费云版服务：

- **Supabase** (https://supabase.com)
  - 免费额度：500MB 数据库，2GB 带宽
  - 特点：功能丰富，易于使用

- **Neon** (https://neon.tech)
  - 免费额度：3GB 数据库，无限制连接
  - 特点：性能优秀，支持分支

- **Railway** (https://railway.app)
  - 免费额度：$5/月
  - 特点：部署简单，集成度高

### 2. 获取数据库连接信息

从选定的服务获取：
- 主机地址
- 端口
- 用户名
- 密码
- 数据库名
- SSL 配置

### 3. 设置环境变量

```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
export NODE_ENV=production
export JWT_SECRET="your-super-secret-key"
export CORS_ORIGIN="https://yourdomain.com"
```

### 4. 部署数据库

```bash
npm run db:setup:prod
```

### 5. 启动服务

```bash
NODE_ENV=production npm start
```

## 🔒 安全配置

### JWT 配置
- 密钥：使用强随机字符串
- 过期时间：7天（可配置）
- 存储：环境变量

### 密码安全
- 加密：bcryptjs，盐值轮数 10
- 验证：长度、复杂度检查

### CORS 配置
- 开发环境：允许本地域名
- 生产环境：仅允许指定域名

## 📝 API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 用户管理
- `GET /api/users` - 获取用户列表（管理员）
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

### 代码片段
- `GET /api/code-snippets` - 获取代码片段列表
- `POST /api/code-snippets` - 创建代码片段
- `PUT /api/code-snippets/:id` - 更新代码片段
- `DELETE /api/code-snippets/:id` - 删除代码片段

### 学习进度
- `GET /api/learning-progress` - 获取学习进度
- `POST /api/learning-progress` - 更新学习进度

### 用户偏好
- `GET /api/user-preferences` - 获取用户偏好
- `PUT /api/user-preferences` - 更新用户偏好

## 🧪 测试

### 运行测试
```bash
npm test
```

### 测试数据库
```bash
NODE_ENV=test npm run db:setup
```

## 📁 项目结构

```
server/
├── config/                 # 配置文件
│   ├── database.js        # 数据库配置
│   ├── environment.js     # 环境配置
│   └── production.example.js # 生产环境配置示例
├── prisma/                # Prisma 配置
│   └── schema.prisma      # 数据库模型定义
├── generated/              # 生成的 Prisma 客户端
├── services/               # 业务逻辑服务
│   └── userService.js     # 用户服务
├── scripts/                # 脚本文件
│   ├── migrate.js         # 数据库迁移脚本
│   └── seed.js            # 数据种子脚本
├── routes/                 # 路由定义
├── middleware/             # 中间件
├── controllers/            # 控制器
├── models/                 # 数据模型（已迁移到 Prisma）
├── .env                    # 环境变量
├── package.json            # 项目配置
└── README.md               # 项目文档
```

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: Prisma 客户端生成失败
A: 确保已安装依赖并运行 `npm run db:generate`

### Q: 数据库连接失败
A: 检查环境变量和数据库服务状态

### Q: 迁移失败
A: 检查数据库权限和连接字符串格式

### Q: 生产环境部署问题
A: 确保设置了正确的环境变量和数据库连接

## 📞 支持

如果遇到问题，请：
1. 查看本文档
2. 检查 GitHub Issues
3. 创建新的 Issue 描述问题

---

**Happy Coding! 🎉**

