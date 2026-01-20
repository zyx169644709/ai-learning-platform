// Vue 学习辅助服务接口模块 - 模拟实现

// 导入DeepSeek服务
import { askTeachingAssistant, analyzeCodeWithDeepSeek } from './ai/deepseekService.ts'

// 类型定义
interface AiResponse {
  type: 'text' | 'tip';
  content: string;
  title?: string;
}

interface MockAiResponses {
  questions: Record<string, AiResponse>;
  learningTips: {
    default: AiResponse;
  };
  codeAnalysis: {
    default: AiResponse;
  };
}

/**
 * 向 Vue 专家助教提问 - 使用 DeepSeek API
 * @param question - 用户问题
 * @returns 助教回答
 */
export const askAiQuestion = async (question: string): Promise<AiResponse> => {
  try {
    const content = await askTeachingAssistant(question)
    return {
      type: 'text',
      content: content
    }
  } catch (error) {
    console.error('助教问答失败:', error)
    return getMockResponse(question)
  }
}

/**
 * 分析 Vue 代码 - 使用 DeepSeek API
 * @param code - 要分析的代码
 * @returns 代码分析结果
 */
export const analyzeCode = async (code: string): Promise<AiResponse> => {
  try {
    const content = await analyzeCodeWithDeepSeek(code, 'vue', 'explain')
    return {
      type: 'text',
      content: content
    }
  } catch (error) {
    console.error('代码分析失败:', error)
    // 降级到模拟分析
    return getMockCodeAnalysis(code)
  }
}

/**
 * 获取 Vue 学习建议
 * @param topic - 特定主题（可选）
 * @returns 学习建议
 */
export const getLearningTips = async (topic?: string): Promise<AiResponse> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  // 根据主题返回不同建议
  if (topic && (topic.includes('响应式') || topic.includes('ref') || topic.includes('reactive'))) {
    return {
      type: 'tip',
      title: 'Vue 响应式学习建议',
      content: '1. 理解 ref 和 reactive 的区别与适用场景。\n2. 学习 Vue 3 的 Proxy 响应式原理。\n3. 注意解构 reactive 丢失响应性的问题，使用 toRefs 解决。\n4. 熟练使用 computed 和 watch 进行状态派生和副作用处理。'
    }
  } else if (topic && (topic.includes('组件') || topic.includes('通信'))) {
    return {
      type: 'tip',
      title: 'Vue 组件化学习建议',
      content: '1. 掌握 Props 和 Emits 的基本用法。\n2. 学习 Provide / Inject 进行跨级组件通信。\n3. 熟悉插槽（Slots）的高级用法，包括具名插槽和作用域插槽。\n4. 理解组件生命周期及其在 Composition API 中的对应钩子。'
    }
  }
  
  // 默认学习建议
  return mockAiResponses.learningTips.default
}

// 保留原有的模拟回答作为降级方案
const getMockResponse = (question: string): AiResponse => {
  const predefinedAnswer = mockAiResponses.questions[question]
  if (predefinedAnswer) {
    return predefinedAnswer
  }
  
  return {
    type: 'text',
    content: `感谢你的提问："${question}"\n\n这是一个很好的关于 Vue 的问题。建议查阅官方文档中关于组合式 API 的部分，或者查看本平台的“组件进阶”章节。如果你有更具体的代码问题，欢迎贴出代码让我分析。`
  }
}

const getMockCodeAnalysis = (code: string): AiResponse => {
  return mockAiResponses.codeAnalysis.default
}

// 模拟助教响应数据
const mockAiResponses: MockAiResponses = {
  questions: {
    '什么是 Vue 3？': {
      type: 'text',
      content: 'Vue 3 是 Vue.js 框架的最新主版本，引入了 Composition API（组合式 API）、更快的虚拟 DOM、更小的捆绑包大小以及更好的 TypeScript 支持。'
    },
    'Vue 3 和 Vue 2 有什么区别？': {
      type: 'text',
      content: '主要区别包括：\n1. 性能提升：Proxy 替代 Object.defineProperty。\n2. 组合式 API：更好的逻辑复用和代码组织。\n3. Teleport、Suspense 等新特性。\n4. 更好的 TypeScript 集成。'
    }
  },
  learningTips: {
    default: {
      type: 'tip',
      title: 'Vue 3 学习建议',
      content: '1. 先掌握基础语法，再深入 Composition API。\n2. 多看官方文档，它是最权威的资料。\n3. 尝试手写一些小的自定义 Hooks (Composables)。\n4. 关注 Vue 生态，如 Vite、Pinia 和 Vue Router。'
    }
  },
  codeAnalysis: {
    default: {
      type: 'text',
      content: '这段代码看起来是在定义一个 Vue 组件。使用了 <script setup> 语法糖，这是 Vue 3 推荐的写法。代码逻辑清晰，建议为 ref 定义明确的类型以增强健壮性。'
    }
  }
}
