import axios from 'axios'
import { kimiRateLimiter } from '@/utils/rateLimiter'

// Moonshot Kimi API
const KIMI_API_BASE = 'https://api.moonshot.cn/v1'
console.log('[Kimi] env key exists?', Boolean((import.meta as any).env?.VITE_KIMI_API || (import.meta as any).env?.VITE_KIMI_API_KEY))
// 兼容两种变量名：VITE_KIMI_API / VITE_KIMI_API_KEY
const KIMI_API_KEY = (import.meta as any)?.env?.VITE_KIMI_API || (import.meta as any)?.env?.VITE_KIMI_API_KEY

if (!KIMI_API_KEY) {
  // 在构建期给出警告，运行时也会在请求阶段抛错
  // eslint-disable-next-line no-console
  console.warn('[Kimi] 未检测到 VITE_KIMI_API / VITE_KIMI_API_KEY，请在 client/.env.local 中配置')
}

// axios 实例（用于非流式时复用；流式用 fetch）
export const kimiApi = axios.create({
  baseURL: KIMI_API_BASE,
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${KIMI_API_KEY ?? ''}`,
    'Content-Type': 'application/json'
  }
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type StreamCallback = (content: string) => void

/**
 * 生成用户标识（基于浏览器指纹和本地存储）
 */
const getUserIdentifier = (): string => {
  // 尝试从 localStorage 获取用户ID
  let userId = localStorage.getItem('kimi_user_id')
  
  if (!userId) {
    // 生成基于浏览器特征的ID
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('Kimi User ID', 10, 10)
    const fingerprint = canvas.toDataURL()
    userId = btoa(fingerprint).slice(0, 16) + '_' + Date.now()
    localStorage.setItem('kimi_user_id', userId)
  }
  
  return userId
}

/**
 * Kimi 流式对话
 */
export const streamKimi = async (
  question: string,
  onMessage: StreamCallback,
  chatHistory: ChatMessage[] = []
): Promise<void> => {
  if (!KIMI_API_KEY) throw new Error('缺少 Kimi API Key，请在 .env.local 配置 VITE_KIMI_API')

  // 检查使用频率限制
  const userId = getUserIdentifier()
  const rateLimitCheck = kimiRateLimiter.canMakeRequest(userId)
  
  if (!rateLimitCheck.allowed) {
    const remainingTime = rateLimitCheck.remainingTime || 0
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60
    const timeStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`
    
    throw new Error(`${rateLimitCheck.message}，请等待 ${timeStr} 后重试`)
  }

  const systemPrompt = '你是一个专业的中文AI助理，请用清晰、友好的中文回答用户的问题。'

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: question }
  ]

  const resp = await fetch(`${KIMI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIMI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true
    })
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Kimi API 请求失败: ${resp.status} ${text}`)
  }

  if (!resp.body) throw new Error('Kimi 响应体为空')

  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) continue
      const jsonStr = trimmed.slice(5).trim()
      if (jsonStr === '[DONE]') continue
      try {
        const data = JSON.parse(jsonStr)
        const content: string | undefined = data?.choices?.[0]?.delta?.content
        if (content) onMessage(content)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Kimi] 解析流式数据失败:', e)
      }
    }
  }
}


