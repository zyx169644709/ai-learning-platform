#!/usr/bin/env ts-node

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function updateCoverPaths() {
  console.log('开始更新封面路径...')

  // 更新课程封面路径
  const courses = await prisma.course.findMany()
  
  for (const course of courses) {
    let newCoverPath = course.cover
    
    if (course.cover && course.cover.startsWith('/assets/images/cover/')) {
      // 保持原有路径，因为文件确实存在于 cover 目录下
      newCoverPath = course.cover
    } else if (course.cover && course.cover.startsWith('/assets/images/')) {
      // 如果路径是 /assets/images/ 开头但不是 cover 目录，保持不变
      newCoverPath = course.cover
    } else if (!course.cover) {
      // 如果没有封面，根据课程标题设置默认封面
      if (course.title.includes('Prompt') || course.title.includes('工程')) {
        newCoverPath = '/assets/images/cover/Prompt.png'
      } else if (course.title.includes('RAG')) {
        newCoverPath = '/assets/images/cover/RAG.png'
      } else if (course.title.includes('深度学习') || course.title.includes('DL')) {
        newCoverPath = '/assets/images/cover/DL.png'
      } else if (course.title.includes('计算机视觉') || course.title.includes('CV')) {
        newCoverPath = '/assets/images/cover/CV.png'
      } else if (course.title.includes('自然语言') || course.title.includes('NLP')) {
        newCoverPath = '/assets/images/cover/NLP.png'
      } else {
        newCoverPath = '/assets/images/cover/Python.png' // 默认封面
      }
    }
    
    if (newCoverPath !== course.cover) {
      await prisma.course.update({
        where: { id: course.id },
        data: { cover: newCoverPath }
      })
      console.log(`更新课程 "${course.title}" 封面路径: ${newCoverPath}`)
    } else {
      console.log(`课程 "${course.title}" 封面路径已正确: ${newCoverPath}`)
    }
  }

  console.log('封面路径更新完成!')
}

async function main() {
  try {
    await updateCoverPaths()
  } catch (error) {
    console.error('更新失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
