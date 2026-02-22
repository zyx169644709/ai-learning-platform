import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SectionNode {
  id: string
  title: string
  slug: string
  order: number
  excerpt: string
  duration: string
}

export interface ChapterNode {
  id: string
  title: string
  slug: string
  order: number
  children: SectionNode[]
}

export const useChaptersStore = defineStore('chapters', () => {
  const chapters = ref<ChapterNode[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const fetchChapters = async () => {
    if (loaded.value) return
    loading.value = true
    try {
      const res = await fetch('/api/chapters')
      const json = await res.json()
      if (json.success) {
        chapters.value = json.data
        loaded.value = true
      }
    } catch (e) {
      console.error('Failed to fetch chapters:', e)
    } finally {
      loading.value = false
    }
  }

  return { chapters, loading, loaded, fetchChapters }
})
