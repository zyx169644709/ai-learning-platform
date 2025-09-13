import axios from 'axios';
// 类型定义
interface CozeConfig {
  botId: string;
  apiToken: string;
  userId: string;
}

interface CozeMessage {
  role: string;
  content: string;
  content_type: string;
}

interface CozeResponse {
  content?: string;
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  message?: {
    content?: string;
  };
}

type MessageCallback = (chunk: string) => void;
console.log('[coze env]', (import.meta as any).env?.VITE_COZE_Tarot_BOT_ID, Boolean((import.meta as any).env?.VITE_COZE_Tarot_API_TOKEN))

const cozeApi = axios.create({
  baseURL: 'https://api.coze.cn/v3',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 从环境变量读取配置（支持通用、Tarot、MBTI 兼容变量名）
const ENV: any = (import.meta as any)?.env || {};
const ENV_COZE_BOT_ID: string | undefined =
  ENV.VITE_COZE_BOT_ID ||
  ENV.VITE_COZE_Tarot_BOT_ID ||
  ENV.VITE_COZE_MBTI_BOT_ID;
const ENV_COZE_API_TOKEN: string | undefined =
  ENV.VITE_COZE_API_TOKEN ||
  ENV.VITE_COZE_Tarot_API_TOKEN ||
  ENV.VITE_COZE_MBTI_API_TOKEN;

const DEFAULT_COZE_CONFIG: CozeConfig = {
  botId: ENV_COZE_BOT_ID || '',
  apiToken: ENV_COZE_API_TOKEN || '',
  userId: 'user_' + Date.now()
};

/**
 * 发送消息到Coze智能体
 * @param message - 用户消息
 * @param onMessage - 接收流式消息的回调函数
 * @param signal - AbortSignal用于取消请求
 * @returns Promise
 */ 

export const sendMessageToCoze = async (
  message: string,
  onMessage: MessageCallback,
  signal?: AbortSignal,
  config?: Partial<CozeConfig>
): Promise<void> => {
  try {
    if (!message?.trim()) {
      throw new Error('问题不能为空');
    }

    const cfg: CozeConfig = {
      botId: config?.botId || DEFAULT_COZE_CONFIG.botId,
      apiToken: config?.apiToken || DEFAULT_COZE_CONFIG.apiToken,
      userId: config?.userId || DEFAULT_COZE_CONFIG.userId,
    };

    if (!cfg.botId || !cfg.apiToken) {
      throw new Error('缺少 Coze 配置：请在 client/.env.local 中设置 VITE_COZE_BOT_ID(VITE_COZE_MBTI_BOT_ID) 与 VITE_COZE_API_TOKEN(VITE_COZE_MBTI_API_TOKEN)');
    }

    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: cfg.botId,
        user_id: cfg.userId,
        stream: true,
        additional_messages: [
          {
            role: "user",
            content: message,
            content_type: "text"
          } as CozeMessage
        ]
      }),
      signal
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `请求失败: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasReceivedFinalMessage = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

        try {
          const jsonStr = trimmedLine.slice(5).trim();
          if (jsonStr === '[DONE]') continue;

          const obj: CozeResponse = JSON.parse(jsonStr);
          const content = obj.content;
          const deltaContent = obj.choices?.[0]?.delta?.content;
          const finalMessage = obj.message?.content;
          
          // 处理最终消息 - 只在没有收到最终消息时处理
          if (finalMessage && !hasReceivedFinalMessage) {
            // 过滤掉JSON控制信息
            let cleanMessage = finalMessage;
            if (cleanMessage.includes('"name":"chouqutaluopai-get_taro_card"') || 
                cleanMessage.includes('"plugin_id"') || 
                cleanMessage.includes('"taroList"') ||
                cleanMessage.includes('"msg_type":"generate_answer_finish"') ||
                cleanMessage.trim().startsWith('{')) {
              continue;
            }
            
            // 清理分隔符和前导空白
            cleanMessage = cleanMessage.replace(/={4,}/g, '').trim();
            
            if (cleanMessage) {
              // 发送最终完整消息，这应该包含完整的回答和相关问题推荐
              onMessage(cleanMessage);
              hasReceivedFinalMessage = true;
            }
            continue;
          }
          
          // 处理增量消息（只在没有收到最终消息时处理）
          if (!hasReceivedFinalMessage && (deltaContent || content)) {
            let chunk = deltaContent || content;
            
            if (!chunk) continue;
            
            // 过滤控制信息
            if (chunk.includes('"name":"chouqutaluopai-get_taro_card"') || 
                chunk.includes('"plugin_id"') || 
                chunk.includes('"taroList"') ||
                chunk.includes('"msg_type":"generate_answer_finish"') ||
                chunk.trim().startsWith('{')) {
              continue;
            }
            
            // 清理分隔符和前导空白
            chunk = chunk.replace(/={4,}/g, '').trim();
            
            if (chunk.trim()) {
              onMessage(chunk);
            }
          }
        } catch (e) {
          console.warn('解析消息失败:', e);
        }
      }
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      throw new Error(`占卜失败: ${error.message}`);
    }
  }
};