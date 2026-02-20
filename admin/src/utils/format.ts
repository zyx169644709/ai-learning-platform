/**
 * 格式化日期时间为友好格式
 * @param date 日期字符串或 Date 对象
 * @param format 格式类型，默认 'datetime'，可选 'date' 或 'time'
 * @returns 格式化后的字符串
 */
export function formatDate(
  date: string | Date,
  format: 'datetime' | 'date' | 'time' = 'datetime'
): string {
  const d = new Date(date)
  
  // 检查是否为有效日期
  if (isNaN(d.getTime())) {
    return '-'
  }
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

/**
 * 格式化为相对时间（如：刚刚、5分钟前、昨天等）
 * @param date 日期字符串或 Date 对象
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return '-'
  }
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return formatDate(d, 'date')
  }
}
