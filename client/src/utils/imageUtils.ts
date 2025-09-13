// 图片处理工具函数

/**
 * 获取课程封面图片URL
 * 处理部署环境中的静态资源路径问题
 */
export function getCourseCoverUrl(coverPath: string): string {
  if (!coverPath) {
    return '/assets/images/course-beginner-cover.svg'
  }
  
  // 如果已经是完整路径，直接返回
  if (coverPath.startsWith('http') || coverPath.startsWith('/')) {
    return coverPath
  }
  
  // 确保路径以 / 开头
  if (!coverPath.startsWith('/')) {
    return `/${coverPath}`
  }
  
  return coverPath
}

/**
 * 图片加载错误处理
 */
export function handleImageError(event: Event, fallbackSrc: string = '/assets/images/course-beginner-cover.svg') {
  const img = event.target as HTMLImageElement
  console.error('图片加载失败:', img.src)
  
  // 尝试不同的路径格式
  const originalSrc = img.src
  if (originalSrc.includes('/assets/images/cover/')) {
    // 尝试相对路径
    const fileName = originalSrc.split('/').pop()
    if (fileName) {
      img.src = `./assets/images/cover/${fileName}`
      return
    }
  }
  
  // 设置默认图片
  img.src = fallbackSrc
}

/**
 * 图片加载成功处理
 */
export function handleImageLoad(event: Event) {
  const img = event.target as HTMLImageElement
  console.log('图片加载成功:', img.src)
}
