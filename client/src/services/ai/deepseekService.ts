import axios from 'axios'

// DeepSeek API 配置（从环境变量读取，避免硬编码密钥）
const env = (import.meta as any)?.env || {}
const DEEPSEEK_API_BASE = (env.VITE_DEEPSEEK_API_BASE as string)?.toString().trim() || 'https://api.deepseek.com/v1'
const DEEPSEEK_API_KEY = (env.VITE_DEEPSEEK_API_KEY as string | undefined)?.toString().trim()
const FLAG_RAW = (env.VITE_ENABLE_DEEPSEEK as string | undefined)?.toString().trim().toLowerCase() ?? 'false'
const DEEPSEEK_FEATURE_FLAG = FLAG_RAW === 'true' || FLAG_RAW === '1' || FLAG_RAW === 'yes'
const DEEPSEEK_ENABLED = Boolean(DEEPSEEK_FEATURE_FLAG && DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 0)

console.log('[deepseek env]', { flag: (import.meta as any).env?.VITE_ENABLE_DEEPSEEK, keyExists: !!(import.meta as any).env?.VITE_DEEPSEEK_API_KEY })
let deepseekApi: ReturnType<typeof axios.create> | null = null
if (DEEPSEEK_ENABLED) {
  deepseekApi = axios.create({
    baseURL: DEEPSEEK_API_BASE,
    timeout: 30000,
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
} else {
  // 仅警告，不阻断应用启动
  console.warn('[DeepSeek] 未启用：缺少 VITE_DEEPSEEK_API_KEY 或 VITE_ENABLE_DEEPSEEK!=="true"。功能将被禁用。')
}

// 类型定义
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamCallback {
  (content: string): void;
}

/**
 * 智能教学助手 - 回答AI相关问题
 * @param question - 学生问题
 * @param context - 上下文信息（可选）
 * @returns AI回答
 */
export const askTeachingAssistant = async (question: string, context: string = ''): Promise<string> => {
  try {
    if (!DEEPSEEK_ENABLED || !deepseekApi) {
      return 'DeepSeek 功能未启用。请配置 VITE_DEEPSEEK_API_KEY 并将 VITE_ENABLE_DEEPSEEK 设为 true 后重试。'
    }
    const systemPrompt = `你是一个专业的AI教学助手，专门帮助学生学习人工智能、机器学习和深度学习相关知识。请遵循以下原则：

1. 用通俗易懂的语言解释复杂概念
2. 提供具体的代码示例（主要使用Python）
3. 给出实践建议和学习路径
4. 鼓励学生思考和实践
5. 如果问题超出AI领域，请引导回到AI学习主题

请用中文回答，语言要亲切友好，富有教学性。`

    const userMessage = context ? `上下文：${context}\n\n问题：${question}` : question

    const response = await deepseekApi.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    })

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('DeepSeek API调用失败:', error)
    throw new Error('智能教学助手暂时不可用，请稍后再试')
  }
}

/**
 * 流式对话 - 实时获取回答
 * @param question - 学生问题
 * @param onMessage - 接收消息的回调函数
 * @param chatHistory - 对话历史
 * @returns Promise
 */
export const streamTeachingChat = async (
  question: string, 
  onMessage: StreamCallback, 
  chatHistory: ChatMessage[] = []
): Promise<void> => {
  try {
    if (!DEEPSEEK_ENABLED) {
      onMessage('DeepSeek 流式对话未启用。请配置环境变量后重试。')
      return
    }
    const systemPrompt = `你是一个专业的AI教学助手，专门帮助学生学习人工智能、机器学习和深度学习相关知识。请用中文回答，语言要亲切友好，富有教学性。`

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: question }
    ]

    const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('响应体为空')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue

        try {
          const jsonStr = trimmedLine.slice(5).trim()
          if (jsonStr === '[DONE]') continue

          const data = JSON.parse(jsonStr)
          const content = data.choices?.[0]?.delta?.content
          
          if (content) {
            onMessage(content)
          }
        } catch (e) {
          console.warn('解析消息失败:', e)
        }
      }
    }
  } catch (error) {
    console.error('流式对话失败:', error)
    throw new Error('智能教学助手暂时不可用')
  }
}

/**
 * 代码解释和优化
 * @param code - 代码内容
 * @param language - 编程语言
 * @param task - 任务类型：'explain' | 'optimize' | 'debug'
 * @returns 分析结果
 */
export const analyzeCodeWithDeepSeek = async (
  code: string, 
  language: string = 'python', 
  task: 'explain' | 'optimize' | 'debug' = 'explain'
): Promise<string> => {
  try {
    if (!DEEPSEEK_ENABLED || !deepseekApi) {
      return 'DeepSeek 代码分析未启用。请配置 VITE_DEEPSEEK_API_KEY 并将 VITE_ENABLE_DEEPSEEK 设为 true 后重试。'
    }
    let prompt = ''
    
    switch (task) {
      case 'explain':
        prompt = `请详细解释以下${language}代码的功能、工作原理和关键概念：\n\n\`\`\`${language}\n${code}\n\`\`\``
        break
      case 'optimize':
        prompt = `请分析以下${language}代码并提供优化建议，包括性能优化、代码结构改进等：\n\n\`\`\`${language}\n${code}\n\`\`\``
        break
      case 'debug':
        prompt = `请检查以下${language}代码中可能存在的问题和错误，并提供修复建议：\n\n\`\`\`${language}\n${code}\n\`\`\``
        break
    }

    const response = await deepseekApi.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的编程教师，擅长代码分析和教学。请用中文回答，提供清晰的解释和实用的建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('代码分析失败:', error)
    throw new Error('代码分析服务暂时不可用')
  }
}

export const generateLearningPlan = async (
  topic: string, 
  level: 'beginner' | 'intermediate' | 'advanced' = 'beginner', 
  duration: number = 4
): Promise<string> => {
  try {
    if (!DEEPSEEK_ENABLED || !deepseekApi) {
      return 'DeepSeek 学习计划生成功能未启用。请配置环境变量后重试。'
    }
    const prompt = `请为${level === 'beginner' ? '初学者' : level === 'intermediate' ? '中级学习者' : '高级学习者'}制定一个${duration}周的"${topic}"学习计划。

要求：
1. 分周安排学习内容
2. 包含理论学习和实践项目
3. 提供具体的学习资源建议
4. 设置阶段性目标和检验方式
5. 给出学习建议和注意事项

请用中文回答，格式清晰，内容实用。`

    const response = await deepseekApi.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个经验丰富的AI教育专家，擅长制定个性化学习计划。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    })

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('生成学习计划失败:', error)
    throw new Error('学习计划生成服务暂时不可用')
  }
}