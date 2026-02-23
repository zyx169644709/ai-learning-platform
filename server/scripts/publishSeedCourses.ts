/**
 * 将所有 draft 状态的种子课程批量设为 published
 * 
 * 用法：npx ts-node scripts/publishSeedCourses.ts
 */

const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.course.updateMany({
    where: {
      status: 'draft',
      NOT: {
        id: { startsWith: 'course-' }
      }
    },
    data: {
      status: 'published'
    }
  })

  console.log(`已将 ${result.count} 个草稿课程设为 published`)
  await prisma.$disconnect()
}

main()
