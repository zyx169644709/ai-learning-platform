# API 返回数据结构参考

本文档记录了系统各个 API 接口返回的核心数据结构，方便开发时查看和参考。

---

## 1. 用户数据 (User)

**API**: `/admin/users`

```json
{
  "id": "cmmcrtxar0004ucq46ydcol2z",
  "name": "user_5",
  "email": "user_5@example.com",
  "avatar": "",
  "role": "USER",
  "status": "active",
  "progress": 0,
  "completedCourses": 0,
  "lastLogin": "-",
  "registeredAt": "2026-03-05 09:12",
  "courses": [],
  "favoritesCount": 0,
  "discussionsCount": 0,
  "commentsCount": 0
}
```

**字段说明**:
- `id`: 用户唯一标识
- `name`: 用户名
- `email`: 邮箱
- `avatar`: 头像URL（可为空）
- `role`: 角色 (`USER` | `MODERATOR` | `ADMIN`)
- `status`: 状态 (`active` | `inactive`)
- `progress`: 学习进度百分比
- `completedCourses`: 已完成课程数
- `lastLogin`: 最后登录时间（格式：`YYYY-MM-DD HH:mm` 或 `-`）
- `registeredAt`: 注册时间（格式：`YYYY-MM-DD HH:mm`）
- `courses`: 用户课程列表
- `favoritesCount`: 收藏数
- `discussionsCount`: 讨论数
- `commentsCount`: 评论数

---

## 2. 课程数据 (Course)

**API**: `/admin/courses`

```json
{
  "id": "cmmctkbsk0000uco08gc64lly",
  "title": "test22ew（副本）1（副本）（副本）（副本）（副本）",
  "type": "advanced",
  "duration": "1231",
  "cover": "http://localhost:3000/uploads/image-1771554704584-891183105.png",
  "url": "http://baidu.com1",
  "content": "1231",
  "status": "draft",
  "viewCount": 0,
  "studentCount": 0,
  "favoriteCount": 0,
  "students": 0,
  "completionRate": 0,
  "updatedAt": "2026-03-05 10:01"
}
```

**字段说明**:
- `id`: 课程唯一标识
- `title`: 课程标题
- `type`: 课程类型 (`beginner` | `intermediate` | `advanced`)
- `duration`: 课程时长
- `cover`: 封面图片URL
- `url`: 课程链接
- `content`: 课程内容/描述
- `status`: 状态 (`draft` | `published`)
- `viewCount`: 浏览次数
- `studentCount`: 学生数量
- `favoriteCount`: 收藏数
- `students`: 学生总数
- `completionRate`: 完成率百分比
- `updatedAt`: 更新时间（格式：`YYYY-MM-DD HH:mm`）

---

## 3. 资源数据 (Resource)

**API**: `/admin/resources`

```json
{
  "id": "cmluedasg0000ucucef7984m4",
  "title": "test1",
  "description": "dasd1",
  "cover": "http://localhost:3000/uploads/image-1771858178940-208062969.png",
  "icon": "http://localhost:3000/uploads/image-1771858172762-427258470.png",
  "url": "https://cn.vuejs.org/guide/quick-start1",
  "type": "document",
  "status": "published",
  "viewCount": 6,
  "likeCount": 0,
  "favoriteCount": 0,
  "tags": ["1"],
  "updatedAt": "2026-02-23 22:51"
}
```

**字段说明**:
- `id`: 资源唯一标识
- `title`: 资源标题
- `description`: 资源描述
- `cover`: 封面图片URL
- `icon`: 图标URL
- `url`: 资源链接
- `type`: 资源类型 (`document` | `video` | `tool` | `other`)
- `status`: 状态 (`draft` | `published`)
- `viewCount`: 浏览次数
- `likeCount`: 点赞数
- `favoriteCount`: 收藏数
- `tags`: 标签数组
- `updatedAt`: 更新时间（格式：`YYYY-MM-DD HH:mm`）

---

## 4. 讨论数据 (Discussion)

**API**: `/admin/community/discussions`

```json
{
  "id": "cmm4evooz0001ucksjwmlgt8m",
  "title": "test",
  "content": "test",
  "category": "TECH",
  "status": "published",
  "isPinned": true,
  "views": 12,
  "likes": 1,
  "commentCount": 2,
  "author": "admin",
  "authorId": "cmldqbq6h0000ucwcfz3lt8qc",
  "authorAvatar": null,
  "createdAt": "2026-02-27T04:47:59.168Z",
  "updatedAt": "2026-03-04T02:36:18.089Z"
}
```

**字段说明**:
- `id`: 讨论唯一标识
- `title`: 讨论标题
- `content`: 讨论内容
- `category`: 分类 (`TECH` | `CAREER` | `SHARE` | `QA`)
- `status`: 状态 (`pending` | `published` | `hidden`)
- `isPinned`: 是否置顶
- `views`: 浏览次数
- `likes`: 点赞数
- `commentCount`: 评论数
- `author`: 作者名称
- `authorId`: 作者ID
- `authorAvatar`: 作者头像URL（可为null）
- `createdAt`: 创建时间（ISO 8601格式）
- `updatedAt`: 更新时间（ISO 8601格式）

---

## 5. 章节数据 (Chapter)

**API**: `/admin/chapters?type=chapter`

```json
{
  "id": "chapter-vue-basics",
  "title": "Vue 3 基础入门",
  "type": "chapter",
  "status": "published",
  "updatedAt": "2026-02-26 16:39",
  "displayOrder": "1",
  "childrenCount": 4,
  "children": [
    {
      "id": "section-vue-basics-introduction",
      "title": "Vue 3 简介与环境搭建",
      "type": "section",
      "content": "# Vue 3 简介与环境搭建...",
      "excerpt": "Vue (发音为 /vjuː/，类似 **view**) 是一款用于构建用户界面的 JavaScript 框架...",
      "order": 1,
      "duration": "12分钟",
      "videoUrl": "123",
      "status": "published",
      "viewCount": 13,
      "favoriteCount": 0,
      "parentId": "chapter-vue-basics",
      "parentTitle": "Vue 3 基础入门",
      "updatedAt": "2026-02-24 23:19",
      "displayOrder": "1-1"
    }
  ]
}
```

**字段说明（章节）**:
- `id`: 章节唯一标识
- `title`: 章节标题
- `type`: 类型 (`chapter`)
- `status`: 状态 (`draft` | `published`)
- `updatedAt`: 更新时间（格式：`YYYY-MM-DD HH:mm`）
- `displayOrder`: 显示顺序
- `childrenCount`: 子节数量
- `children`: 子节列表

**字段说明（小节）**:
- `id`: 小节唯一标识
- `title`: 小节标题
- `type`: 类型 (`section`)
- `content`: 小节内容（Markdown格式）
- `excerpt`: 摘要
- `order`: 排序
- `duration`: 时长
- `videoUrl`: 视频URL
- `status`: 状态 (`draft` | `published`)
- `viewCount`: 浏览次数
- `favoriteCount`: 收藏数
- `parentId`: 父章节ID
- `parentTitle`: 父章节标题
- `updatedAt`: 更新时间（格式：`YYYY-MM-DD HH:mm`）
- `displayOrder`: 显示顺序（如 `1-1`）

---

## 6. 评论数据 (Comment)

**API**: `/admin/community/comments`

```json
{
  "id": "cmmbf0f1l0001uccgklupy76f",
  "content": "test-client",
  "status": "visible",
  "likes": 0,
  "author": "admin",
  "authorId": "cmldqbq6h0000ucwcfz3lt8qc",
  "authorAvatar": null,
  "discussionId": "cmm4evooz0001ucksjwmlgt8m",
  "discussionTitle": "test",
  "createdAt": "2026-03-04T02:26:03.173Z",
  "updatedAt": "2026-03-04T02:26:03.173Z"
}
```

**字段说明**:
- `id`: 评论唯一标识
- `content`: 评论内容
- `status`: 状态 (`visible` | `hidden` | `pending`)
- `likes`: 点赞数
- `author`: 作者名称
- `authorId`: 作者ID
- `authorAvatar`: 作者头像URL（可为null）
- `discussionId`: 所属讨论ID
- `discussionTitle`: 所属讨论标题
- `createdAt`: 创建时间（ISO 8601格式）
- `updatedAt`: 更新时间（ISO 8601格式）

---

## 日期格式说明

系统中使用两种日期格式：

1. **格式化日期**: `YYYY-MM-DD HH:mm`
   - 示例: `2026-03-05 09:12`
   - 使用场景: 用户注册时间、课程更新时间、资源更新时间等

2. **ISO 8601 格式**: `YYYY-MM-DDTHH:mm:ss.sssZ`
   - 示例: `2026-02-27T04:47:59.168Z`
   - 使用场景: 讨论创建时间、评论创建时间等

**处理建议**:
```javascript
// 处理格式化日期
const date1 = new Date('2026-03-05 09:12'.replace(' ', 'T'))

// 处理ISO格式
const date2 = new Date('2026-02-27T04:47:59.168Z')

// 兼容两种格式
const dateStr = data.registeredAt || data.createdAt
const date = new Date(dateStr.replace(' ', 'T'))
```

---

## 状态枚举

### 用户状态 (User Status)
- `active`: 活跃
- `inactive`: 未激活

### 用户角色 (User Role)
- `USER`: 普通用户
- `MODERATOR`: 版主
- `ADMIN`: 管理员

### 内容状态 (Content Status)
- `draft`: 草稿
- `published`: 已发布
- `hidden`: 隐藏
- `pending`: 待审核

### 讨论分类 (Discussion Category)
- `TECH`: 技术讨论
- `CAREER`: 职业发展
- `SHARE`: 经验分享
- `QA`: 问答

### 资源类型 (Resource Type)
- `document`: 文档
- `video`: 视频
- `tool`: 工具
- `other`: 其他

### 课程类型 (Course Type)
- `beginner`: 初级
- `intermediate`: 中级
- `advanced`: 高级

---

## 使用示例

### 在仪表盘中使用

```typescript
// 获取今日新增用户
const todayUsers = allUsers.filter((u: any) => {
  const dateStr = u.registeredAt || u.createdAt
  if (!dateStr) return false
  const userDate = new Date(dateStr.replace(' ', 'T'))
  return userDate >= todayStart
})

// 统计待审核内容
const pendingDiscussions = allDiscussions.filter((d: any) => d.status === 'pending')
const pendingComments = allComments.filter((c: any) => c.status === 'pending')

// 统计用户角色分布
const adminCount = allUsers.filter((u: any) => u.role === 'ADMIN').length
const moderatorCount = allUsers.filter((u: any) => u.role === 'MODERATOR').length
const userCount = allUsers.filter((u: any) => u.role === 'USER').length
```

---

**最后更新**: 2026-03-05
