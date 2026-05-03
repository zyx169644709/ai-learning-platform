// 用户角色枚举
export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

// 课程类型枚举
export enum CourseType {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// 课程状态枚举
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 角色标签类型映射
export const roleTagTypeMap: Record<string, string> = {
  [UserRole.USER]: 'primary',
  [UserRole.MODERATOR]: 'success',
  [UserRole.ADMIN]: 'danger'
}

// 角色标签文本映射
export const roleLabelMap: Record<string, string> = {
  [UserRole.USER]: '用户',
  [UserRole.MODERATOR]: '管理员',
  [UserRole.ADMIN]: '超级管理员'
}

// 课程类型标签映射
export const courseTypeTagMap: Record<string, string> = {
  [CourseType.BEGINNER]: 'success',
  [CourseType.INTERMEDIATE]: 'primary',
  [CourseType.ADVANCED]: 'warning'
}

// 课程类型文本映射
export const courseTypeLabelMap: Record<string, string> = {
  [CourseType.BEGINNER]: '初级',
  [CourseType.INTERMEDIATE]: '中级',
  [CourseType.ADVANCED]: '高级'
}

// 课程状态标签映射
export const courseStatusTagMap: Record<string, string> = {
  [CourseStatus.DRAFT]: 'warning',
  [CourseStatus.PUBLISHED]: 'success',
  [CourseStatus.ARCHIVED]: 'info'
}

// 课程状态文本映射
export const courseStatusLabelMap: Record<string, string> = {
  [CourseStatus.DRAFT]: '草稿',
  [CourseStatus.PUBLISHED]: '已发布',
  [CourseStatus.ARCHIVED]: '已归档'
}

// 工具函数：获取角色标签类型
export function getRoleTagType(role: string): string {
  return roleTagTypeMap[role] || 'primary'
}

// 工具函数：获取角色标签文本
export function getRoleLabel(role: string): string {
  return roleLabelMap[role] || '用户'
}

// 工具函数：获取课程类型标签
export function getCourseTypeTag(type: string): string {
  return courseTypeTagMap[type] || 'success'
}

// 工具函数：获取课程类型文本
export function getCourseTypeLabel(type: string): string {
  return courseTypeLabelMap[type] || '基础课程'
}

// 工具函数：获取课程状态标签
export function getCourseStatusTag(status: string): string {
  return courseStatusTagMap[status] || 'warning'
}

// 工具函数：获取课程状态文本
export function getCourseStatusLabel(status: string): string {
  return courseStatusLabelMap[status] || '草稿'
}
