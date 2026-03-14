// 测试通知系统的工具
import { notification } from './notification'

// 在浏览器控制台中运行以下代码来测试通知系统
export const testNotification = () => {
  console.log('开始测试通知系统...')
  
  // 测试成功通知
  setTimeout(() => {
    notification.success('这是成功通知')
  }, 500)
  
  // 测试错误通知
  setTimeout(() => {
    notification.error('这是错误通知')
  }, 1500)
  
  // 测试警告通知
  setTimeout(() => {
    notification.warning('这是警告通知')
  }, 2500)
  
  // 测试信息通知
  setTimeout(() => {
    notification.info('这是信息通知')
  }, 3500)
  
  console.log('通知测试已开始，请查看右上角的通知')
}

// 将测试函数暴露到全局，方便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).testNotification = testNotification
}
