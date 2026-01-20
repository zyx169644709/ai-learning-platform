# Vite 构建工具实践

Vite (法语意为 "快"，发音 /vit/) 是一种新型前端构建工具，能够显著提升前端开发体验。

## 为什么选择 Vite？

- **极速的服务启动**：利用原生 ESM 模块，无需等待打包。
- **轻量快速的热重载 (HMR)**：无论项目大小，HMR 始终极快。
- **开箱即用**：对 TypeScript、JSX、CSS 等支持良好。
- **优化的构建**：基于 Rollup 构建生产环境代码，拥有极致的性能。

## 创建项目

```bash
# 使用 npm
npm create vite@latest my-vue-app -- --template vue

# 使用 yarn
yarn create vite my-vue-app --template vue
```

## 常用配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true
  }
})
```

## 环境变量

Vite 通过 `import.meta.env` 暴露环境变量。

- `import.meta.env.MODE`: 应用运行的模式。
- `import.meta.env.BASE_URL`: 部署应用时的基本 URL。
- `import.meta.env.PROD`: 是否为生产环境。
- `import.meta.env.DEV`: 是否为开发环境。
