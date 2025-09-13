import { sendMessageToCoze } from './cozeService.ts'

type MessageCallback = (chunk: string) => void

/**
 * 发送消息到 MBTI 智能体（Coze）
 * - 使用环境变量提供的 MBTI Bot 凭据
 * - 签名与 sendMessageToCoze 一致，便于替换
 */
console.log('[coze env]', (import.meta as any).env?.VITE_COZE_MBTI_BOT_ID, Boolean((import.meta as any).env?.VITE_COZE_MBTI_API_TOKEN))
export const sendMessageToMBTI = async (
  message: string,
  onMessage: MessageCallback,
  signal?: AbortSignal
): Promise<void> => {
  const botId = import.meta.env.VITE_COZE_MBTI_BOT_ID as string | undefined
  const apiToken = import.meta.env.VITE_COZE_MBTI_API_TOKEN as string | undefined

  if (!botId || !apiToken) {
    throw new Error('缺少 MBTI Bot 配置：请在 client/.env.local 中设置 VITE_COZE_MBTI_BOT_ID 与 VITE_COZE_MBTI_API_TOKEN')
  }

  return sendMessageToCoze(message, onMessage, signal, {
    botId,
    apiToken,
    userId: 'user_' + Date.now()
  })
}


