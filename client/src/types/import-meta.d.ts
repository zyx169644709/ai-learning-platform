interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_COZE_MBTI_BOT_ID?: string
  readonly VITE_COZE_MBTI_API_TOKEN?: string
  readonly VITE_DEEPSEEK_API_KEY?: string
  readonly VITE_DEEPSEEK_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
