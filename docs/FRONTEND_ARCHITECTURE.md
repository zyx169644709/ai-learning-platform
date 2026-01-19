# 前端架构详细说明文档

## 架构概览

前端采用Vue 3 + TypeScript + Vite的现代化技术栈，遵循组件化、模块化的设计原则，实现了高性能、可维护的单页应用(SPA)。

## 技术栈详情

### 核心框架
- **Vue 3.5.18**: 采用Composition API，提供更好的逻辑复用和类型推导
- **TypeScript 5.9.2**: 严格类型检查，提升代码质量和开发体验
- **Vite 7.0.4**: 基于ESM的构建工具，支持快速热更新和优化构建

### UI框架与样式
- **Element Plus 2.10.7**: Vue 3组件库，提供丰富的UI组件
- **TailwindCSS 3.4.4**: 实用优先的CSS框架，支持快速样式开发
- **PostCSS**: CSS后处理器，支持自动前缀和优化

### 状态管理与路由
- **Pinia 3.0.3**: Vue官方推荐的状态管理库，支持TypeScript
- **Pinia Plugin Persistedstate**: 状态持久化插件
- **Vue Router 4.5.1**: 官方路由管理器，支持动态路由和导航守卫

### 工具库
- **Axios 1.11.0**: HTTP客户端，支持请求拦截和响应处理
- **Monaco Editor 0.50.0**: VS Code同款代码编辑器
- **Markdown-it 14.1.0**: Markdown解析器
- **Highlight.js 11.11.1**: 代码高亮库
- **DOMPurify 3.2.6**: XSS防护库
- **MiniSearch 7.1.2**: 轻量级全文搜索引擎

## 目录结构详解

```
client/
├── public/                     # 静态资源
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── main.ts                # 应用入口文件
│   ├── App.vue                # 根组件
│   ├── assets/                # 静态资源
│   │   ├── images/           # 图片资源
│   │   └── styles/           # 样式文件
│   │       ├── themes.css    # 主题样式
│   │       └── global.css    # 全局样式
│   ├── components/            # 可复用组件
│   │   └── common/           # 通用组件
│   │       ├── Header.vue    # 页头组件
│   │       ├── Sidebar.vue   # 侧边栏组件
│   │       ├── AiPanel.vue   # AI对话面板
│   │       └── Loading.vue   # 加载组件
│   ├── pages/                 # 页面组件
│   │   ├── Home.vue          # 首页
│   │   ├── Login.vue         # 登录页
│   │   ├── Register.vue      # 注册页
│   │   ├── Profile.vue       # 个人资料页
│   │   ├── Courses.vue       # 课程列表页
│   │   ├── Resources.vue     # 资源列表页
│   │   ├── Community.vue     # 社区讨论页
│   │   ├── CodeEditor.vue    # 代码编辑器页
│   │   ├── SearchResults.vue # 搜索结果页
│   │   ├── agent/            # AI Agent页面
│   │   │   ├── Tarot.vue    # Tarot占卜
│   │   │   └── MBTI.vue     # MBTI测试
│   │   └── api/              # AI API页面
│   │       ├── DeepSeek.vue # DeepSeek对话
│   │       └── Kimi.vue     # Kimi对话
│   ├── router/               # 路由配置
│   │   └── index.ts         # 路由定义和守卫
│   ├── services/             # 业务服务层
│   │   ├── api.ts           # API基础配置
│   │   ├── auth.ts          # 认证服务
│   │   ├── ai.ts            # AI服务
│   │   ├── search.ts        # 搜索服务
│   │   ├── user.ts          # 用户服务
│   │   ├── course.ts        # 课程服务
│   │   ├── resource.ts      # 资源服务
│   │   └── community.ts     # 社区服务
│   ├── stores/               # 状态管理
│   │   ├── auth.ts          # 认证状态
│   │   ├── user.ts          # 用户状态
│   │   └── preferences.ts   # 偏好设置状态
│   ├── types/                # 类型定义
│   │   ├── api.ts           # API类型
│   │   ├── user.ts          # 用户类型
│   │   ├── course.ts        # 课程类型
│   │   └── common.ts        # 通用类型
│   ├── utils/                # 工具函数
│   │   ├── request.ts       # 请求工具
│   │   ├── storage.ts       # 存储工具
│   │   └── format.ts        # 格式化工具
│   ├── content/              # 内容数据
│   │   ├── chapters/        # 章节内容
│   │   └── markdown/        # Markdown文件
│   ├── auto-imports.d.ts     # 自动导入类型声明
│   └── components.d.ts       # 组件类型声明
├── .env.example              # 环境变量示例
├── .env.local               # 本地环境变量
├── vite.config.ts           # Vite配置
├── tsconfig.json            # TypeScript配置
├── tailwind.config.js       # TailwindCSS配置
└── package.json             # 项目依赖
```

## 核心架构设计

### 1. 组件化架构

#### 组件分层
```
┌─────────────────────────────────────┐
│              Pages                  │  ← 页面级组件
├─────────────────────────────────────┤
│            Business                 │  ← 业务组件
├─────────────────────────────────────┤
│             Common                  │  ← 通用组件
├─────────────────────────────────────┤
│              Base                   │  ← 基础组件
└─────────────────────────────────────┘
```

#### 组件设计原则
- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 通用组件支持多场景使用
- **可组合性**: 组件间通过props和events通信
- **可测试性**: 组件逻辑独立，便于单元测试

### 2. 状态管理架构

#### Pinia Store设计
```typescript
// 认证状态管理
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.user?.role
  },
  actions: {
    async login(credentials: LoginCredentials) { /* ... */ },
    async logout() { /* ... */ },
    async refreshToken() { /* ... */ }
  },
  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['token', 'user']
  }
})
```

#### 状态分层
- **全局状态**: 用户信息、认证状态、主题设置
- **页面状态**: 表单数据、加载状态、错误信息
- **组件状态**: UI交互状态、临时数据

### 3. 路由架构

#### 路由配置
```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: false,
      hideLeftSidebar: false,
      hideRightSidebar: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hideLeftSidebar: true,
      hideRightSidebar: true
    }
  }
]
```

#### 路由守卫
```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})
```

### 4. 服务层架构

#### API服务设计
```typescript
// 基础API配置
class BaseAPI {
  private baseURL: string
  private axios: AxiosInstance

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.axios = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.axios.interceptors.request.use(
      (config) => {
        const token = getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.axios.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // 处理token过期
          handleTokenExpired()
        }
        return Promise.reject(error)
      }
    )
  }
}
```

#### 服务层分类
- **认证服务**: 登录、注册、token管理
- **用户服务**: 用户信息、偏好设置
- **内容服务**: 课程、资源、社区内容
- **AI服务**: 多AI接口集成和流式处理
- **搜索服务**: 全文搜索和结果聚合

### 5. AI集成架构

#### AI服务抽象
```typescript
interface AIService {
  name: string
  sendMessage(message: string, context?: ChatContext): Promise<AIResponse>
  sendStreamMessage(message: string, context?: ChatContext): AsyncGenerator<AIStreamChunk>
}

class DeepSeekService implements AIService {
  name = 'DeepSeek'
  
  async sendMessage(message: string, context?: ChatContext) {
    // 实现DeepSeek API调用
  }
  
  async *sendStreamMessage(message: string, context?: ChatContext) {
    // 实现流式响应处理
  }
}
```

#### 流式响应处理
```typescript
class StreamProcessor {
  private buffer: string = ''
  private decoder = new TextDecoder()

  async processStream(stream: ReadableStream, callback: (chunk: string) => void) {
    const reader = stream.getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = this.decoder.decode(value, { stream: true })
      this.buffer += chunk
      
      // 处理完整的JSON行
      const lines = this.buffer.split('\n')
      this.buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line)
            callback(data.content || '')
          } catch (e) {
            console.warn('解析流数据失败:', line)
          }
        }
      }
    }
  }
}
```

## 性能优化策略

### 1. 代码分割
```typescript
// 路由懒加载
const routes = [
  {
    path: '/courses',
    component: () => import('@/pages/Courses.vue')
  }
]

// 组件懒加载
const HeavyComponent = defineAsyncComponent({
  loader: () => import('@/components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 2. 虚拟滚动
```vue
<template>
  <VirtualList
    :items="largeList"
    :item-height="50"
    :visible-count="10"
    v-slot="{ item, index }"
  >
    <ListItem :item="item" :index="index" />
  </VirtualList>
</template>
```

### 3. 图片懒加载
```vue
<template>
  <img
    v-lazy="imageUrl"
    :alt="imageAlt"
    class="lazy-image"
  />
</template>
```

### 4. 缓存策略
```typescript
// HTTP缓存
const api = new BaseAPI(API_BASE_URL)
api.axios.defaults.headers.common['Cache-Control'] = 'max-age=3600'

// 内存缓存
class MemoryCache {
  private cache = new Map<string, any>()
  private ttl = new Map<string, number>()

  set(key: string, value: any, ttl: number = 300000) {
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + ttl)
  }

  get(key: string) {
    const expireTime = this.ttl.get(key)
    if (expireTime && Date.now() > expireTime) {
      this.cache.delete(key)
      this.ttl.delete(key)
      return null
    }
    return this.cache.get(key)
  }
}
```

## 错误处理机制

### 1. 全局错误处理
```typescript
// Vue错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue错误:', err)
  // 发送错误报告到监控服务
  sendErrorReport({
    error: err.message,
    stack: err.stack,
    component: instance?.$options.name,
    info
  })
}

// Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
  event.preventDefault()
})
```

### 2. API错误处理
```typescript
class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 统一错误处理
const handleAPIError = (error: any) => {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        redirectToLogin()
        break
      case 'FORBIDDEN':
        showErrorMessage('权限不足')
        break
      default:
        showErrorMessage(error.message)
    }
  } else {
    showErrorMessage('网络错误，请稍后重试')
  }
}
```

## 测试策略

### 1. 单元测试
```typescript
// 组件测试
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ButtonComponent from '@/components/Button.vue'

describe('ButtonComponent', () => {
  it('should emit click event when clicked', async () => {
    const wrapper = mount(ButtonComponent)
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

### 2. 集成测试
```typescript
// API服务测试
import { describe, it, expect, vi } from 'vitest'
import { authService } from '@/services/auth'

describe('AuthService', () => {
  it('should login successfully with valid credentials', async () => {
    const mockResponse = { token: 'mock-token', user: { id: 1, name: 'Test' } }
    vi.spyOn(axios, 'post').mockResolvedValue({ data: mockResponse })
    
    const result = await authService.login('test@example.com', 'password')
    expect(result.token).toBe('mock-token')
  })
})
```

## 部署配置

### 1. Vite配置
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          editor: ['monaco-editor']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### 2. 环境配置
```typescript
// .env.local
VITE_API_BASE=http://localhost:3000/api
VITE_ENABLE_DEEPSEEK=true
VITE_DEEPSEEK_API_BASE=https://api.deepseek.com/v1
VITE_DEEPSEEK_API_KEY=your-api-key
VITE_ENABLE_KIMI=true
VITE_KIMI_API_BASE=https://api.moonshot.cn/v1
VITE_KIMI_API_KEY=your-api-key
```

## 最佳实践

### 1. 代码规范
- 使用TypeScript严格模式
- 遵循Vue 3 Composition API最佳实践
- 组件命名采用PascalCase
- 文件命名采用kebab-case

### 2. 性能优化
- 合理使用computed和watch
- 避免不必要的响应式数据
- 使用v-memo优化列表渲染
- 图片资源优化和CDN加速

### 3. 安全考虑
- XSS防护：使用DOMPurify清理用户输入
- CSRF防护：使用CSRF令牌
- 敏感信息：避免在前端存储敏感数据
- API安全：使用HTTPS和token认证

### 4. 可维护性
- 组件职责单一明确
- 服务层抽象业务逻辑
- 统一的错误处理机制
- 完善的类型定义

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-06  
**维护团队**: AI Learning Platform Team
