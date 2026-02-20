interface FilterOptions {
  onSearch: () => void
  debounceDelay?: number
}

export function useFilter(options: FilterOptions) {
  const { onSearch, debounceDelay = 500 } = options

  // 防抖定时器
  let debounceTimer: NodeJS.Timeout | null = null

  // 带防抖的搜索函数
  const debouncedSearch = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      onSearch()
    }, debounceDelay)
  }

  // 清理定时器
  const cleanup = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  return {
    debouncedSearch,
    cleanup
  }
}
