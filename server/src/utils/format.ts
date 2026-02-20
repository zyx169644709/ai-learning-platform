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
