# 通用目录侧边栏组件使用指南

## 组件概述

这套组件提供了一个可复用的目录侧边栏系统，适用于课程、资源、文档等任何需要分类展示的页面。

## 组件结构

- **CatalogSidebar.vue** - 侧边栏容器组件
- **CatalogItem.vue** - 传统式目录项（始终展开）
- **CatalogItemCollapsible.vue** - 折叠式目录项（可展开/收起）

## 使用方法

### 1. 在 Layout 中使用

```vue
<template>
  <div class="layout">
    <CatalogSidebar 
      v-if="!route.meta.hideLeftSidebar"
      :categories="categoriesWithItems"
      route-name="DetailPage"
      route-param-key="id"
    />
    
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CatalogSidebar from '@/components/common/CatalogSidebar.vue'

const route = useRoute()
const items = ref([])

// 准备分类数据
const categoriesWithItems = computed(() => {
  return CATEGORIES.map(category => ({
    key: category.key,        // 分类唯一标识
    label: category.label,    // 分类显示名称
    items: items.value.filter(item => item.category === category.key)
  }))
})

onMounted(async () => {
  // 加载数据
  const res = await fetch('/api/items')
  items.value = await res.json()
})
</script>

<style scoped>
.main-content {
  left: 320px; /* 侧边栏宽度 */
}

.main-content.no-left {
  left: 0;
}

@media (max-width: 900px) {
  .main-content {
    left: 0;
  }
}
</style>
```

### 2. Props 说明

#### CatalogSidebar

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| categories | `CatalogCategory[]` | 是 | 分类数据数组 |
| routeName | `string` | 是 | 点击项目时跳转的路由名称 |
| routeParamKey | `string` | 否 | 路由参数键名，默认为 `'id'` |

#### CatalogCategory 数据结构

```typescript
interface CatalogCategory {
  key: string        // 分类唯一标识
  label: string      // 分类显示名称
  items?: any[]      // 该分类下的项目列表（必须包含 id 和 title 字段）
}
```

### 3. 实际使用示例

#### 课程页面（已实现）

```vue
<CatalogSidebar 
  :categories="categoriesWithCourses"
  route-name="CourseDetail"
  route-param-key="id"
/>
```

数据准备：
```typescript
const categoriesWithCourses = computed(() => {
  return COURSE_CATEGORY_OPTIONS.map(category => ({
    key: category.key,
    label: category.label,
    items: courses.value.filter(item => item.category === category.key)
  }))
})
```

#### 资源页面（示例）

```vue
<CatalogSidebar 
  :categories="categoriesWithResources"
  route-name="ResourceDetail"
  route-param-key="resourceId"
/>
```

数据准备：
```typescript
const RESOURCE_CATEGORIES = [
  { key: 'video', label: '视频教程' },
  { key: 'article', label: '文章资料' },
  { key: 'tool', label: '开发工具' },
  { key: 'book', label: '电子书籍' }
]

const categoriesWithResources = computed(() => {
  return RESOURCE_CATEGORIES.map(category => ({
    key: category.key,
    label: category.label,
    items: resources.value.filter(item => item.type === category.key)
  }))
})
```

## 功能特性

1. **风格偏好切换** - 用户可以在传统式（始终展开）和折叠式（可展开/收起）之间切换
2. **自动高亮** - 当前激活的项目会自动高亮显示
3. **智能展开** - 折叠式模式下，包含当前激活项目的分类会自动展开
4. **响应式设计** - 在小屏幕设备上自动隐藏侧边栏
5. **统一样式** - 与文档侧边栏保持完全一致的视觉效果

## 注意事项

1. 传入的 `items` 数组中的每个对象必须包含 `id` 和 `title` 字段
2. `routeName` 必须是已定义的路由名称
3. `routeParamKey` 应与目标路由的参数名称匹配
4. 侧边栏宽度固定为 320px，主内容区需要设置 `left: 320px`

## 旧组件迁移

如果你之前使用了特定的侧边栏组件（如 CourseCategoryItem），可以直接替换为通用组件：

**之前：**
```vue
<aside class="sidebar">
  <ul class="chapter-list">
    <CourseCategoryItem v-for="cat in categories" :key="cat.key" :category="cat" />
  </ul>
</aside>
```

**现在：**
```vue
<CatalogSidebar 
  :categories="categories"
  route-name="CourseDetail"
/>
```

代码量减少 90%，功能更强大！
