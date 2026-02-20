import { ref, reactive } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

interface CrudOptions {
  apiPath: string
  resourceName: string
  filterFields?: string[]
}

export function useCrud<T = any>(options: CrudOptions) {
  const { apiPath, resourceName, filterFields = [] } = options

  // 数据列表
  const items = ref<T[]>([])
  const loading = ref(false)

  // 筛选表单
  const filterForm = reactive<Record<string, any>>(
    filterFields.reduce((acc, field) => {
      acc[field] = ''
      return acc
    }, {} as Record<string, any>)
  )

  // 防抖定时器
  let debounceTimer: NodeJS.Timeout | null = null

  // 对话框状态
  const showViewDialog = ref(false)
  const showEditDialog = ref(false)
  const selectedItem = ref<T | null>(null)
  const editingItem = ref<T | null>(null)
  const saving = ref(false)

  // 表单引用
  const formRef = ref<FormInstance>()

  // 加载列表
  const loadItems = async (paginationParams: any, extraParams: any = {}) => {
    loading.value = true
    try {
      const params: any = {
        ...paginationParams,
        _t: Date.now() // 防止缓存
      }

      // 添加筛选条件
      Object.keys(filterForm).forEach(key => {
        if (filterForm[key]) {
          params[key] = filterForm[key]
        }
      })

      // 添加额外参数
      Object.assign(params, extraParams)

      const response = await request.get(apiPath, { params })

      if (response.data.success) {
        items.value = response.data.data.items
        return {
          items: response.data.data.items,
          total: response.data.data.total
        }
      }
      return { items: [], total: 0 }
    } catch (error) {
      console.error(`加载${resourceName}列表失败:`, error)
      ElMessage.error(`加载${resourceName}列表失败`)
      return { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }

  // 带防抖的搜索
  const debouncedSearch = (callback: () => void, delay = 500) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(callback, delay)
  }

  // 重置筛选
  const resetFilter = (callback: () => void) => {
    Object.keys(filterForm).forEach(key => {
      filterForm[key] = ''
    })
    callback()
  }

  // 查看详情
  const viewItem = (item: T) => {
    selectedItem.value = item
    showViewDialog.value = true
  }

  // 编辑项目
  const editItem = (item: T | null, form: any) => {
    editingItem.value = item
    if (item) {
      // 只合并 item 中有值的字段，避免 undefined 覆盖
      Object.keys(item).forEach(key => {
        if ((item as any)[key] !== undefined) {
          form[key] = (item as any)[key]
        }
      })
    } else {
      // 创建新项目，重置表单
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }
    showEditDialog.value = true
  }

  // 保存项目
  const saveItem = async (form: any, callback: () => void) => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      saving.value = true
      try {
        const isEdit = !!editingItem.value
        const url = isEdit ? `${apiPath}/${(editingItem.value as any).id}` : apiPath
        const method = isEdit ? 'put' : 'post'

        const response = await request[method](url, form)

        if (response.data.success) {
          ElMessage.success(isEdit ? '更新成功' : '创建成功')
          showEditDialog.value = false
          callback()
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || `保存${resourceName}失败`)
      } finally {
        saving.value = false
      }
    })
  }

  // 删除项目
  const deleteItem = async (id: string | number, callback: () => void) => {
    try {
      const response = await request.delete(`${apiPath}/${id}`)
      if (response.data.success) {
        ElMessage.success('删除成功')
        callback()
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }

  // 批量删除
  const batchDelete = async (ids: (string | number)[], callback: () => void) => {
    try {
      await Promise.all(ids.map(id => request.delete(`${apiPath}/${id}`)))
      ElMessage.success('批量删除成功')
      callback()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }

  return {
    // 数据
    items,
    loading,
    filterForm,
    
    // 对话框状态
    showViewDialog,
    showEditDialog,
    selectedItem,
    editingItem,
    saving,
    
    // 表单引用
    formRef,
    
    // 方法
    loadItems,
    debouncedSearch,
    resetFilter,
    viewItem,
    editItem,
    saveItem,
    deleteItem,
    batchDelete
  }
}
