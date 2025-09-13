import { defineStore } from 'pinia'

export type AppTheme = 'light' | 'dark'

export interface UserPrefsState {
  theme: AppTheme
  locale: string
  codePanelRatio: number
  version: number
  sidebarDefaultExpanded: boolean
}

export const useUserPrefs = defineStore('userPrefs', {
  state: (): UserPrefsState => ({
    theme: 'light',
    locale: 'zh-CN',
    codePanelRatio: 50,
    version: 1,
    sidebarDefaultExpanded: true
  }),
  actions: {
    setTheme(theme: AppTheme) { this.theme = theme },
    setLocale(locale: string) { this.locale = locale },
    setCodePanelRatio(ratio: number) { this.codePanelRatio = Math.min(80, Math.max(20, Math.round(ratio))) },
    setSidebarDefaultExpanded(v: boolean) { this.sidebarDefaultExpanded = v }
  },
  persist: {
    key: 'alp:prefs:v1',
    storage: localStorage,
    pick: ['theme', 'locale', 'codePanelRatio', 'version', 'sidebarDefaultExpanded'],
    debug: import.meta.env.DEV
  }
})
