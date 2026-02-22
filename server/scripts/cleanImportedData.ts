/**
 * 清理所有课程数据
 * 
 * 使用方式：
 * npx ts-node --transpile-only scripts/cleanImportedData.ts
 */

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 开始清理所有课程数据...\n')
  
  // 统计课程数量
  const count = await prisma.course.count()
  
  console.log(`📚 找到 ${count} 个课程`)
  
  if (count === 0) {
    console.log('\n✨ 没有需要清理的数据')
    await prisma.$disconnect()
    return
  }
  
  // 删除所有课程
  const result = await prisma.course.deleteMany({})
  console.log(`📚 已删除 ${result.count} 个课程`)
  
  console.log('\n✨ 清理完成！')
  
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ 清理失败:', e)
  process.exit(1)
})
