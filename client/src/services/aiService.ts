// AI服务接口模块 - 模拟实现

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
 * 向AI提问 - 使用DeepSeek API
 * @param question - 用户问题
 * @returns AI回答
 */
export const askAiQuestion = async (question: string): Promise<AiResponse> => {
  try {
    const content = await askTeachingAssistant(question)
    return {
      type: 'text',
      content: content
    }
  } catch (error) {
    console.error('AI问答失败:', error)
    return getMockResponse(question)
  }
}

/**
 * 分析代码 - 使用DeepSeek API
 * @param code - 要分析的代码
 * @returns 代码分析结果
 */
export const analyzeCode = async (code: string): Promise<AiResponse> => {
  try {
    const content = await analyzeCodeWithDeepSeek(code, 'python', 'explain')
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
 * 获取学习建议
 * @param topic - 特定主题（可选）
 * @returns 学习建议
 */
export const getLearningTips = async (topic?: string): Promise<AiResponse> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  // 根据主题返回不同建议
  if (topic && topic.includes('机器学习')) {
    return {
      type: 'tip',
      title: '机器学习学习建议',
      content: '学习机器学习的有效方法：\n1. 掌握数学基础：线性代数、微积分和概率统计\n2. 实践项目从简单开始，如鸢尾花分类、房价预测\n3. 理解算法原理而非仅记忆API\n4. 使用scikit-learn构建基线模型，再尝试深度学习\n5. 分析模型结果，理解为什么做出这样的预测\n6. 参与Kaggle竞赛获取实战经验\n7. 阅读相关论文，了解最新研究进展\n\n推荐资源：Andrew Ng的机器学习课程，《机器学习实战》书籍，scikit-learn官方文档。'
    }
  } else if (topic && topic.includes('神经网络')) {
    return {
      type: 'tip',
      title: '神经网络学习建议',
      content: '学习神经网络的建议：\n1. 先理解感知器和反向传播算法\n2. 从简单的前馈网络开始\n3. 使用TensorFlow或PyTorch等框架实践\n4. 可视化神经网络的工作过程\n5. 尝试不同的激活函数和网络结构\n6. 学习处理过拟合问题的方法\n7. 实现经典网络结构如CNN和RNN\n\n推荐先实现一个简单的神经网络，手动计算梯度下降过程，再使用框架构建更复杂的模型。记住，实践是掌握神经网络的关键。'
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
    content: `感谢你的提问："${question}"\n\n这是一个很好的问题。根据课程内容，我的回答是：\n\n人工智能是一个广泛的领域，包含许多子学科和技术。针对你的问题，建议查阅课程第2章和第3章的内容，那里有更详细的解释和示例。如果你有更具体的疑问，我很乐意进一步帮助你。`
  }
}

const getMockCodeAnalysis = (code: string): AiResponse => {
  // 原有的模拟代码分析逻辑...
  return mockAiResponses.codeAnalysis.default
}

// 模拟AI响应数据
const mockAiResponses: MockAiResponses = {
  questions: {
    '什么是人工智能？': {
      type: 'text',
      content: '人工智能（AI）是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统。这些任务包括学习、推理、问题解决、感知和语言理解。'
    },
    '机器学习有哪些类型？': {
      type: 'text',
      content: '机器学习主要分为三种类型：\n1. 监督学习：使用标记数据训练模型\n2. 无监督学习：从未标记数据中发现模式\n3. 强化学习：通过与环境交互学习最优策略'
    }
  },
  learningTips: {
    default: {
      type: 'tip',
      title: '通用学习建议',
      content: '学习AI的建议：\n1. 建立扎实的数学基础\n2. 多动手实践项目\n3. 理解原理而非仅记忆\n4. 参与社区讨论\n5. 持续学习新技术'
    }
  },
  codeAnalysis: {
    default: {
      type: 'text',
      content: '代码分析：\n这是一个基础的代码示例，建议：\n1. 添加适当的注释\n2. 使用有意义的变量名\n3. 考虑错误处理\n4. 优化性能瓶颈'
    }
  }
}
