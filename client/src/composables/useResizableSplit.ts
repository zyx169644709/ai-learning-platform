import { ref, onUnmounted } from 'vue'

export function useResizableSplit(initialRatio = 0.5) {
  const editorMain = ref<HTMLElement | null>(null)
  const isResizing = ref(false)
  const codePanelWidth = ref(initialRatio * 10)
  const outputPanelWidth = ref(10 - initialRatio * 10)

  const startResize = (e: PointerEvent) => {
    isResizing.value = true
    e.preventDefault()

    if (e.target instanceof HTMLElement) {
      e.target.setPointerCapture(e.pointerId)
    }

    document.documentElement.addEventListener('pointermove', handleResize)
    document.documentElement.addEventListener('pointerup', stopResize)
    document.documentElement.addEventListener('pointercancel', stopResize)
  }

  const handleResize = (e: PointerEvent) => {
    if (!isResizing.value || !editorMain.value) return
    const rect = editorMain.value.getBoundingClientRect()
    const isMobile = window.innerWidth <= 1200
    if (isMobile) {
      let ratio = (e.clientY - rect.top) / rect.height
      ratio = Math.min(0.8, Math.max(0.2, ratio))
      codePanelWidth.value = ratio * 10
    } else {
      let ratio = (e.clientX - rect.left) / rect.width
      ratio = Math.min(0.8, Math.max(0.2, ratio))
      codePanelWidth.value = ratio * 10
    }
    outputPanelWidth.value = 10 - codePanelWidth.value
  }

  const stopResize = (e?: PointerEvent) => {
    if (!isResizing.value) return
    isResizing.value = false
    if (e?.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId)
    }
    document.removeEventListener('pointermove', handleResize as any)
    document.removeEventListener('pointerup', stopResize as any)
    document.removeEventListener('pointercancel', stopResize as any)
  }

  const resetToDefaultRatio = () => {
    codePanelWidth.value = 5
    outputPanelWidth.value = 5
  }

  const showResizeCursor = () => {
    document.body.style.cursor = 'col-resize'
  }

  const hideResizeCursor = () => {
    document.body.style.cursor = ''
  }

  onUnmounted(() => {
    document.removeEventListener('pointermove', handleResize as any)
    document.removeEventListener('pointerup', stopResize as any)
    document.removeEventListener('pointercancel', stopResize as any)
  })

  return {
    editorMain,
    isResizing,
    codePanelWidth,
    outputPanelWidth,
    startResize,
    handleResize,
    stopResize,
    resetToDefaultRatio,
    showResizeCursor,
    hideResizeCursor
  }
}
