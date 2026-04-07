import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const map: Record<string, string> = {
    '初级': 'beginner',
    '中级': 'intermediate',
    '高级': 'advanced'
  }

  let total = 0
  for (const [cn, en] of Object.entries(map)) {
    const result = await prisma.course.updateMany({
      where: { level: cn },
      data: { level: en }
    })
    console.log(`${cn} → ${en}: 更新 ${result.count} 条`)
    total += result.count
  }
  console.log(`\n完成！共更新 ${total} 条记录`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
