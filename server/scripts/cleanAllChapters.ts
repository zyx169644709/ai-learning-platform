/**
 * 清理所有章节数据
 * 
 * 使用方式：
 * npx ts-node --transpile-only scripts/cleanAllChapters.ts
 */

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 开始清理所有章节数据...\n')
  
  // 统计章节数量
  const count = await prisma.chapter.count()
  
  console.log(`📄 找到 ${count} 个章节`)
  
  if (count === 0) {
    console.log('\n✨ 没有需要清理的数据')
    await prisma.$disconnect()
    return
  }
  
  // 删除所有章节（由于级联删除，会先删除子章节）
  // 先删除所有小节（有 parentId 的）
  const sectionsResult = await prisma.chapter.deleteMany({
    where: {
      parentId: { not: null }
    }
  })
  console.log(`📄 已删除 ${sectionsResult.count} 个小节`)
  
  // 再删除所有章节（没有 parentId 的）
  const chaptersResult = await prisma.chapter.deleteMany({})
  console.log(`📚 已删除 ${chaptersResult.count} 个章节`)
  
  console.log('\n✨ 清理完成！')
  
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ 清理失败:', e)
  process.exit(1)
})
