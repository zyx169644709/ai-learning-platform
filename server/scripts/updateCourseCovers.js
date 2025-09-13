const { PrismaClient } = require('../generated/prisma')

const prisma = new PrismaClient()

async function updateCourseCovers() {
  try {
    console.log('开始更新课程封面路径...')
    
    // 查找所有需要更新的课程
    const courses = await prisma.course.findMany({
      where: {
        cover: {
          startsWith: '/src/assets/images/'
        }
      }
    })
    
    console.log(`找到 ${courses.length} 个需要更新的课程`)
    
    // 逐个更新每个课程
    for (const course of courses) {
      const newCover = course.cover.replace('/src/assets/images/', '/assets/images/')
      await prisma.course.update({
        where: { id: course.id },
        data: { cover: newCover }
      })
      console.log(`更新课程 ${course.title}: ${course.cover} -> ${newCover}`)
    }
    
    console.log('课程封面路径更新完成！')
    
  } catch (error) {
    console.error('更新失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCourseCovers()
