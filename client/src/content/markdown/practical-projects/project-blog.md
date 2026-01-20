# 项目实战：个人博客系统 (SPA)

构建一个完整的单页面应用 (SPA)，掌握 Vue Router 和异步数据处理。

## 学习目标

- 深入应用 `vue-router` 进行页面导航。
- 练习使用 `axios` 或 `fetch` 获取远程数据。
- 掌握组件生命周期与数据获取的时机。
- 使用 `Transition` 组件实现页面切换动画。
- 学习简单的布局组件封装。

## 功能要求

1. **首页列表**：展示所有博文的标题、摘要和发布日期。
2. **文章详情**：点击列表项进入详情页，查看完整内容。
3. **分类过滤**：点击分类标签，筛选显示相关文章。
4. **404 页面**：处理不存在的路由。
5. **加载状态**：在数据请求期间显示 Loading 效果。

## 推荐组件结构

- `views/Home.vue`：博文列表视图。
- `views/PostDetail.vue`：文章详情视图。
- `components/PostCard.vue`：列表项卡片组件。
- `components/NavBar.vue`：顶部导航栏。
- `components/Loading.vue`：通用加载指示器。

---
**提示**：你可以尝试使用 Markdown 渲染库（如 `marked` 或 `markdown-it`）来渲染博文正文。
