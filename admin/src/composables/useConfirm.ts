import { ElMessageBox } from 'element-plus'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
  type?: 'success' | 'warning' | 'info' | 'error'
}

export function useConfirm() {
  // 通用确认对话框
  const confirm = async (options: ConfirmOptions): Promise<boolean> => {
    try {
      await ElMessageBox.confirm(
        options.message,
        options.title || '提示',
        {
          confirmButtonText: options.confirmButtonText || '确定',
          cancelButtonText: options.cancelButtonText || '取消',
          type: options.type || 'warning'
        }
      )
      return true
    } catch {
      return false
    }
  }

  // 删除确认
  const confirmDelete = async (itemName: string = '该项'): Promise<boolean> => {
    return confirm({
      title: '警告',
      message: `确定要删除${itemName}吗？此操作不可恢复！`,
      confirmButtonText: '删除',
      type: 'error'
    })
  }

  // 禁用确认
  const confirmDisable = async (itemName: string = '该账号'): Promise<boolean> => {
    return confirm({
      title: '警告',
      message: `确定要禁用${itemName}吗？`,
      type: 'warning'
    })
  }

  // 重置密码确认
  const confirmResetPassword = async (): Promise<boolean> => {
    return confirm({
      title: '提示',
      message: '确定要重置该用户的密码吗？',
      type: 'warning'
    })
  }

  // 归档确认
  const confirmArchive = async (itemName: string = '该项'): Promise<boolean> => {
    return confirm({
      title: '提示',
      message: `确定要归档${itemName}吗？`,
      type: 'warning'
    })
  }

  return {
    confirm,
    confirmDelete,
    confirmDisable,
    confirmResetPassword,
    confirmArchive
  }
}
