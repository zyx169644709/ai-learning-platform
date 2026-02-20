import { ref } from 'vue'

export function useTableActions() {
  // 选中的项目
  const selectedItems = ref<any[]>([])

  // 处理选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedItems.value = selection
  }

  // 清空选择
  const clearSelection = () => {
    selectedItems.value = []
  }

  // 获取选中的 ID 列表
  const getSelectedIds = () => {
    return selectedItems.value.map(item => item.id)
  }

  return {
    selectedItems,
    handleSelectionChange,
    clearSelection,
    getSelectedIds
  }
}
