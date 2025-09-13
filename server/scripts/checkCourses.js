const { PrismaClient } = require('../generated/prisma')

const prisma = new PrismaClient()

async function checkCourses() {
  try {
    console.log('检查课程数据...')
    
    const courses = await prisma.course.findMany()
    console.log(`数据库中共有 ${courses.length} 个课程:`)
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`)
      console.log(`   封面: ${course.cover}`)
      console.log(`   ID: ${course.id}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCourses()
