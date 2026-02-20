import { reactive } from 'vue'

export interface PaginationOptions {
  page?: number
  size?: number
  total?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const pagination = reactive({
    page: options.page || 1,
    size: options.size || 20,
    total: options.total || 0
  })

  // 重置分页
  const resetPagination = () => {
    pagination.page = 1
    pagination.total = 0
  }

  // 设置总数
  const setTotal = (total: number) => {
    pagination.total = total
  }

  // 获取分页参数
  const getPaginationParams = () => {
    return {
      page: pagination.page,
      limit: pagination.size
    }
  }

  return {
    pagination,
    resetPagination,
    setTotal,
    getPaginationParams
  }
}
