# Vitest 与组件测试

在现代 Vue 开发中，自动化测试是确保应用质量的重要环节。Vue 推荐使用 Vitest 进行单元测试和组件测试。

## 为什么选择 Vitest？

- **极速**：基于 Vite，拥有极快的启动和热重载速度。
- **兼容性**：与 Jest 的 API 高度兼容，迁移容易。
- **原生支持**：对 Vue SFC、TypeScript 和 JSX 的原生支持。
- **开箱即用**：集成了断言、Mock 和覆盖率工具。

## 安装

如果你使用 `npm create vue@latest` 创建项目，可以选择包含 Vitest。

```bash
npm install -D vitest @vue/test-utils jsdom
```

## 编写第一个测试

创建一个简单的组件测试文件 `MyComponent.spec.ts`：

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('应该正确渲染初始文本', () => {
    const wrapper = mount(MyComponent, {
      props: { msg: 'Hello Vitest' }
    })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('点击按钮后计数器应该增加', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.count').text()).toBe('1')
  })
})
```

## 测试最佳实践

1.  **测试组件的行为而非实现**：关注输入 (Props/Events) 和输出 (Rendered DOM/Emitted events)。
2.  **Mock 外部依赖**：对于 API 请求或复杂的插件，使用 `vi.mock()`。
3.  **保持测试独立**：每个测试用例不应该依赖于其他测试的状态。
