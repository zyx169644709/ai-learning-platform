# API接口文档

## 概述

AI学习平台提供RESTful API接口，支持用户认证、内容管理、社区讨论、AI服务等功能。所有API接口遵循统一的响应格式和错误处理机制。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **API版本**: v1.0.0
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据内容
  },
  "pagination": {  // 分页数据时包含
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  }
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

## 认证接口

### 1. 用户注册

**POST** `/user/register`

注册新用户账号。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，3-20字符 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码，至少6字符 |
| bio | string | 否 | 个人简介 |
| avatar | string | 否 | 头像URL |

#### 请求示例

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "bio": "这是一个测试用户"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "cuid123",
      "username": "testuser",
      "email": "test@example.com",
      "bio": "这是一个测试用户",
      "avatar": null,
      "role": "USER",
      "createdAt": "2026-01-06T10:00:00.000Z",
      "userPreferences": {
        "theme": "dark",
        "codePanelRatio": 50,
        "language": "javascript",
        "notifications": true
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 用户登录

**POST** `/user/login`

用户登录获取访问令牌。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

#### 请求示例

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "cuid123",
      "username": "testuser",
      "email": "test@example.com",
      "bio": "这是一个测试用户",
      "avatar": null,
      "role": "USER",
      "lastLoginAt": "2026-01-06T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 刷新令牌

**POST** `/user/refresh`

刷新访问令牌。

#### 请求头

```
Authorization: Bearer <token>
```

#### 响应示例

```json
{
  "success": true,
  "message": "令牌刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. 用户登出

**POST** `/user/logout`

用户登出（可选，客户端删除token即可）。

#### 请求头

```
Authorization: Bearer <token>
```

#### 响应示例

```json
{
  "success": true,
  "message": "登出成功"
}
```

## 用户管理接口

### 1. 获取当前用户信息

**GET** `/user/profile`

获取当前登录用户的详细信息。

#### 请求头

```
Authorization: Bearer <token>
```

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "cuid123",
    "username": "testuser",
    "email": "test@example.com",
    "bio": "这是一个测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "createdAt": "2026-01-06T10:00:00.000Z",
    "lastLoginAt": "2026-01-06T15:30:00.000Z",
    "userPreferences": {
      "theme": "dark",
      "codePanelRatio": 50,
      "language": "javascript",
      "notifications": true
    },
    "_count": {
      "discussions": 5,
      "comments": 12
    }
  }
}
```

### 2. 更新用户信息

**PUT** `/user/profile`

更新当前用户的基本信息。

#### 请求头

```
Authorization: Bearer <token>
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 用户名 |
| bio | string | 否 | 个人简介 |
| avatar | string | 否 | 头像URL |

#### 请求示例

```json
{
  "bio": "更新后的个人简介",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "cuid123",
    "username": "testuser",
    "email": "test@example.com",
    "bio": "更新后的个人简介",
    "avatar": "https://example.com/new-avatar.jpg",
    "role": "USER",
    "updatedAt": "2026-01-06T16:00:00.000Z"
  }
}
```

### 3. 更新用户偏好

**PUT** `/user/preferences`

更新用户偏好设置。

#### 请求头

```
Authorization: Bearer <token>
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| theme | string | 否 | 主题：light/dark |
| codePanelRatio | number | 否 | 代码面板比例：0-100 |
| language | string | 否 | 默认编程语言 |
| notifications | boolean | 否 | 是否启用通知 |

#### 请求示例

```json
{
  "theme": "light",
  "codePanelRatio": 60,
  "language": "typescript",
  "notifications": false
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "偏好设置更新成功",
  "data": {
    "theme": "light",
    "codePanelRatio": 60,
    "language": "typescript",
    "notifications": false,
    "updatedAt": "2026-01-06T16:00:00.000Z"
  }
}
```

### 4. 修改密码

**PUT** `/user/password`

修改用户密码。

#### 请求头

```
Authorization: Bearer <token>
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| currentPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码，至少6字符 |

#### 请求示例

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "密码修改成功"
}
```

## 课程管理接口

### 1. 获取课程列表

**GET** `/courses`

获取课程列表，支持分页和筛选。

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| level | string | 否 | 课程难度 |
| tags | string | 否 | 标签，逗号分隔 |
| search | string | 否 | 搜索关键词 |

#### 请求示例

```
GET /courses?page=1&limit=10&level=beginner&tags=vue,javascript
```

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "id": "cuid123",
      "title": "Vue 3 基础教程",
      "description": "从零开始学习Vue 3框架",
      "level": "beginner",
      "cover": "https://example.com/vue3-cover.jpg",
      "url": "https://example.com/vue3-basics",
      "tags": ["vue", "frontend", "javascript"],
      "createdAt": "2026-01-06T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2. 获取课程详情

**GET** `/courses/:id`

获取指定课程的详细信息。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 课程ID |

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "cuid123",
    "title": "Vue 3 基础教程",
    "description": "从零开始学习Vue 3框架，包含组件、路由、状态管理等核心概念。",
    "level": "beginner",
    "cover": "https://example.com/vue3-cover.jpg",
    "url": "https://example.com/vue3-basics",
    "tags": ["vue", "frontend", "javascript"],
    "createdAt": "2026-01-06T10:00:00.000Z",
    "updatedAt": "2026-01-06T10:00:00.000Z"
  }
}
```

### 3. 创建课程

**POST** `/courses`

创建新课程（需要管理员权限）。

#### 请求头

```
Authorization: Bearer <token>
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 课程标题 |
| description | string | 否 | 课程描述 |
| level | string | 否 | 课程难度 |
| cover | string | 否 | 封面图片URL |
| url | string | 是 | 课程链接 |
| tags | array | 否 | 标签数组 |

#### 请求示例

```json
{
  "title": "React 18 进阶教程",
  "description": "深入学习React 18的新特性和最佳实践",
  "level": "intermediate",
  "cover": "https://example.com/react18-cover.jpg",
  "url": "https://example.com/react18-advanced",
  "tags": ["react", "frontend", "javascript"]
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "课程创建成功",
  "data": {
    "id": "cuid456",
    "title": "React 18 进阶教程",
    "description": "深入学习React 18的新特性和最佳实践",
    "level": "intermediate",
    "cover": "https://example.com/react18-cover.jpg",
    "url": "https://example.com/react18-advanced",
    "tags": ["react", "frontend", "javascript"],
    "createdAt": "2026-01-06T16:00:00.000Z"
  }
}
```

## 资源管理接口

### 1. 获取资源列表

**GET** `/resources`

获取学习资源列表。

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| tags | string | 否 | 标签，逗号分隔 |
| search | string | 否 | 搜索关键词 |

#### 请求示例

```
GET /resources?page=1&limit=10&search=typescript
```

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "id": "cuid789",
      "title": "TypeScript 官方文档",
      "description": "TypeScript官方文档中文版",
      "cover": "https://example.com/ts-docs-cover.jpg",
      "url": "https://www.typescriptlang.org/docs/",
      "tags": ["typescript", "documentation", "official"],
      "createdAt": "2026-01-06T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### 2. 获取资源详情

**GET** `/resources/:id`

获取指定资源的详细信息。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 资源ID |

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "cuid789",
    "title": "TypeScript 官方文档",
    "description": "TypeScript官方文档中文版，包含完整的语言特性和最佳实践指南。",
    "cover": "https://example.com/ts-docs-cover.jpg",
    "url": "https://www.typescriptlang.org/docs/",
    "tags": ["typescript", "documentation", "official"],
    "createdAt": "2026-01-06T10:00:00.000Z",
    "updatedAt": "2026-01-06T10:00:00.000Z"
  }
}
```

### 3. 创建资源

**POST** `/resources`

创建新的学习资源（需要管理员权限）。

#### 请求头

```
Authorization: Bearer <token>
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 资源标题 |
| description | string | 否 | 资源描述 |
| cover | string | 否 | 封面图片URL |
| url | string | 是 | 资源链接 |
| tags | array | 否 | 标签数组 |

#### 请求示例

```json
{
  "title": "Vue 3 Composition API 指南",
  "description": "详细介绍Vue 3 Composition API的使用方法和最佳实践",
  "cover": "https://example.com/vue3-composition-cover.jpg",
  "url": "https://example.com/vue3-composition-guide",
  "tags": ["vue", "composition-api", "frontend"]
}
```

## 社区讨论接口

### 1. 获取讨论列表

**GET** `/community/discussions`

获取社区讨论列表。

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| category | string | 否 | 讨论分类 |
| sortBy | string | 否 | 排序字段：createdAt/views/likes |
| sortOrder | string | 否 | 排序方向：asc/desc |

#### 请求示例

```
GET /community/discussions?page=1&limit=10&category=TECH&sortBy=likes&sortOrder=desc
```

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "id": "cuid111",
      "title": "Vue 3 vs React 18 对比分析",
      "excerpt": "我想从多个维度对比分析Vue 3和React 18的主要区别...",
      "category": "TECH",
      "views": 156,
      "likes": 23,
      "createdAt": "2026-01-06T10:00:00.000Z",
      "author": {
        "id": "cuid123",
        "username": "techlover",
        "avatar": "https://example.com/avatar.jpg"
      },
      "_count": {
        "comments": 8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### 2. 获取讨论详情

**GET** `/community/discussions/:id`

获取指定讨论的详细内容和评论。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 讨论ID |

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| commentPage | number | 否 | 评论页码，默认1 |
| commentLimit | number | 否 | 每页评论数，默认10 |

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "cuid111",
    "title": "Vue 3 vs React 18 对比分析",
    "content": "# Vue 3 vs React 18 对比分析\n\n我想从多个维度对比分析Vue 3和React 18的主要区别...",
    "excerpt": "我想从多个维度对比分析Vue 3和React 18的主要区别...",
    "category": "TECH",
    "views": 156,
    "likes": 23,
    "createdAt": "2026-01-06T10:00:00.000Z",
    "updatedAt": "2026-01-06T12:00:00.000Z",
    "author": {
      "id": "cuid123",
      "username": "techlover",
      "avatar": "https://example.com/avatar.jpg"
    },
    "comments": [
      {
        "id": "cuid222",
        "content": "很好的对比分析！我觉得Vue 3在开发体验上确实更友好一些。",
        "likes": 5,
        "createdAt": "2026-01-06T11:00:00.000Z",
        "author": {
          "id": "cuid333",
          "username": "vuefan",
          "avatar": "https://example.com/vue-avatar.jpg"
        }
      }
    ],
    "pagination": {
      "commentPage": 1,
      "commentLimit": 10,
      "commentTotal": 8,
      "commentTotalPages": 1
    }
  }
}
```

### 3. 创建讨论

**POST** `/community/discussions`

创建新的讨论帖子。

#### 请求头

```
Authorization: Bearer <token>
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 讨论标题 |
| content | string | 是 | 讨论内容（Markdown） |
| category | string | 是 | 讨论分类 |

#### 请求示例

```json
{
  "title": "如何优化Vue 3应用的性能？",
  "content": "# Vue 3性能优化技巧\n\n我在开发Vue 3应用时遇到了一些性能问题...",
  "category": "HELP"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "讨论创建成功",
  "data": {
    "id": "cuid444",
    "title": "如何优化Vue 3应用的性能？",
    "excerpt": "我在开发Vue 3应用时遇到了一些性能问题...",
    "category": "HELP",
    "views": 0,
    "likes": 0,
    "createdAt": "2026-01-06T16:00:00.000Z",
    "author": {
      "id": "cuid123",
      "username": "testuser",
      "avatar": null
    }
  }
}
```

### 4. 添加评论

**POST** `/community/discussions/:id/comments`

为指定讨论添加评论。

#### 请求头

```
Authorization: Bearer <token>
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 讨论ID |

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 评论内容 |

#### 请求示例

```json
{
  "content": "我觉得可以使用虚拟滚动来优化长列表的性能。"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "评论添加成功",
  "data": {
    "id": "cuid555",
    "content": "我觉得可以使用虚拟滚动来优化长列表的性能。",
    "likes": 0,
    "createdAt": "2026-01-06T16:30:00.000Z",
    "author": {
      "id": "cuid123",
      "username": "testuser",
      "avatar": null
    }
  }
}
```

### 5. 点赞讨论

**POST** `/community/discussions/:id/like`

点赞或取消点赞讨论。

#### 请求头

```
Authorization: Bearer <token>
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 讨论ID |

#### 响应示例

```json
{
  "success": true,
  "message": "点赞成功",
  "data": {
    "liked": true,
    "likes": 24
  }
}
```

### 6. 点赞评论

**POST** `/community/comments/:id/like`

点赞或取消点赞评论。

#### 请求头

```
Authorization: Bearer <token>
```

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 评论ID |

#### 响应示例

```json
{
  "success": true,
  "message": "点赞成功",
  "data": {
    "liked": true,
    "likes": 6
  }
}
```

## AI服务接口

### 1. AI对话

**POST** `/ai/chat`

与AI服务进行对话。

#### 请求头

```
Authorization: Bearer <token>
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| service | string | 是 | AI服务名称：deepseek/kimi/coze |
| message | string | 是 | 用户消息 |
| context | object | 否 | 对话上下文 |
| stream | boolean | 否 | 是否流式响应，默认false |

#### 请求示例

```json
{
  "service": "deepseek",
  "message": "请解释Vue 3的Composition API",
  "context": {
    "messages": [
      {"role": "user", "content": "我想学习Vue 3"},
      {"role": "assistant", "content": "Vue 3是Vue.js的最新版本..."}
    ]
  },
  "stream": false
}
```

#### 响应示例（非流式）

```json
{
  "success": true,
  "message": "对话成功",
  "data": {
    "content": "Vue 3的Composition API是一种新的组件写法...",
    "usage": {
      "promptTokens": 25,
      "completionTokens": 150,
      "totalTokens": 175
    }
  }
}
```

#### 响应示例（流式）

```text
data: {"content": "Vue"}
data: {"content": " 3"}
data: {"content": " 的"}
data: {"content": " Composition"}
data: {"content": " API"}
data: {"finished": true}
```

### 2. AI服务状态

**GET** `/ai/services`

获取可用的AI服务列表。

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "services": [
      {
        "name": "deepseek",
        "displayName": "DeepSeek",
        "status": "available",
        "description": "DeepSeek AI对话服务"
      },
      {
        "name": "kimi",
        "displayName": "Kimi",
        "status": "unavailable",
        "description": "Kimi AI对话服务（未配置）"
      }
    ]
  }
}
```

## 搜索接口

### 1. 全局搜索

**GET** `/search`

在课程、资源、讨论中进行全局搜索。

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型：all/courses/resources/discussions |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |

#### 请求示例

```
GET /search?q=vue&type=all&page=1&limit=10
```

#### 响应示例

```json
{
  "success": true,
  "message": "搜索成功",
  "data": {
    "courses": [
      {
        "id": "cuid123",
        "title": "Vue 3 基础教程",
        "description": "从零开始学习Vue 3框架",
        "level": "beginner",
        "cover": "https://example.com/vue3-cover.jpg",
        "url": "https://example.com/vue3-basics",
        "tags": ["vue", "frontend", "javascript"]
      }
    ],
    "resources": [
      {
        "id": "cuid789",
        "title": "Vue 3 官方文档",
        "description": "Vue 3官方文档",
        "cover": "https://example.com/vue3-docs-cover.jpg",
        "url": "https://vuejs.org/",
        "tags": ["vue", "documentation", "official"]
      }
    ],
    "discussions": [
      {
        "id": "cuid111",
        "title": "Vue 3 vs React 18 对比分析",
        "excerpt": "我想从多个维度对比分析Vue 3和React 18...",
        "category": "TECH",
        "views": 156,
        "likes": 23,
        "createdAt": "2026-01-06T10:00:00.000Z",
        "author": {
          "id": "cuid123",
          "username": "techlover",
          "avatar": "https://example.com/avatar.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## 系统接口

### 1. 健康检查

**GET** `/health`

检查系统健康状态。

#### 响应示例

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-06T16:00:00.000Z",
    "uptime": "2h 30m",
    "memory": {
      "rss": "128MB",
      "heapUsed": "64MB",
      "heapTotal": "96MB"
    },
    "database": "connected",
    "services": {
      "deepseek": "available",
      "kimi": "unavailable",
      "coze": "unavailable"
    }
  }
}
```

### 2. 系统统计

**GET** `/stats`

获取系统统计数据。

#### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "users": {
      "total": 1250,
      "active": 890,
      "newThisMonth": 156
    },
    "content": {
      "courses": 45,
      "resources": 128,
      "discussions": 567,
      "comments": 2340
    },
    "engagement": {
      "totalViews": 15678,
      "totalLikes": 3456,
      "avgSessionDuration": "15m"
    }
  }
}
```

## 错误代码

| 错误代码 | 说明 |
|----------|------|
| INVALID_CREDENTIALS | 登录凭据无效 |
| TOKEN_EXPIRED | 访问令牌已过期 |
| TOKEN_INVALID | 访问令牌无效 |
| INSUFFICIENT_PERMISSIONS | 权限不足 |
| RESOURCE_NOT_FOUND | 资源不存在 |
| RESOURCE_CONFLICT | 资源冲突 |
| VALIDATION_FAILED | 数据验证失败 |
| RATE_LIMIT_EXCEEDED | 请求频率超限 |
| SERVICE_UNAVAILABLE | 服务不可用 |
| DATABASE_ERROR | 数据库错误 |
| AI_SERVICE_ERROR | AI服务错误 |

## 使用示例

### JavaScript/TypeScript

```typescript
// API客户端示例
class APIClient {
  private baseURL = 'http://localhost:3000/api'
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  // 用户登录
  async login(email: string, password: string) {
    const data = await this.request<any>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    this.setToken(data.data.token)
    return data
  }

  // 获取课程列表
  async getCourses(params: any = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request<any>(`/courses?${query}`)
  }

  // 创建讨论
  async createDiscussion(discussionData: any) {
    return this.request<any>('/community/discussions', {
      method: 'POST',
      body: JSON.stringify(discussionData)
    })
  }
}

// 使用示例
const client = new APIClient()

// 登录
await client.login('user@example.com', 'password123')

// 获取课程列表
const courses = await client.getCourses({
  page: 1,
  limit: 10,
  level: 'beginner'
})

// 创建讨论
const discussion = await client.createDiscussion({
  title: 'Vue 3学习心得',
  content: '# Vue 3学习心得\n\n最近在学习Vue 3...',
  category: 'EXPERIENCE'
})
```

### cURL示例

```bash
# 用户登录
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 获取课程列表
curl -X GET "http://localhost:3000/api/courses?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建讨论
curl -X POST http://localhost:3000/api/community/discussions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Vue 3学习心得",
    "content": "# Vue 3学习心得\n\n最近在学习Vue 3...",
    "category": "EXPERIENCE"
  }'
```

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-06  
**维护团队**: AI Learning Platform Team
