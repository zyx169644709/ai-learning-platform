#!/usr/bin/env ts-node

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function fixResourceCovers() {
  console.log('修复资源封面路径...')

  const resources = await prisma.resource.findMany()
  
  for (const resource of resources) {
    let newCoverPath = resource.cover
    
    // 修复重复拼接的路径
    if (resource.cover && resource.cover.includes('/src/assets/images/cover/Python.png/assets/images/')) {
      // 提取正确的路径部分
      const correctPath = resource.cover.split('/src/assets/images/cover/Python.png')[1]
      newCoverPath = correctPath
    } else if (resource.cover && resource.cover.startsWith('/src/assets/images/')) {
      // 将 /src/assets/images/ 转换为 /assets/images/
      newCoverPath = resource.cover.replace('/src/assets/images/', '/assets/images/')
    } else if (!resource.cover) {
      // 根据资源标题设置默认封面
      if (resource.title.includes('Python') || resource.title.includes('机器学习')) {
        newCoverPath = '/assets/images/cover/Python.png'
      } else if (resource.title.includes('Kaggle')) {
        newCoverPath = '/assets/images/cover/Kaggle.png'
      } else if (resource.title.includes('Coursera')) {
        newCoverPath = '/assets/images/cover/Coursera.png'
      } else if (resource.title.includes('深度学习') || resource.title.includes('DL')) {
        newCoverPath = '/assets/images/cover/DL-Project.png'
      } else if (resource.title.includes('Jupyter')) {
        newCoverPath = '/assets/images/cover/Jupyter.png'
      } else if (resource.title.includes('VS Code')) {
        newCoverPath = '/assets/images/cover/VS Code.png'
      } else if (resource.title.includes('NLP') || resource.title.includes('数据集')) {
        newCoverPath = '/assets/images/cover/NLP.png'
      } else if (resource.title.includes('TensorFlow') || resource.title.includes('视频')) {
        newCoverPath = '/assets/images/cover/Python.png' // 默认使用Python图标
      } else {
        newCoverPath = '/assets/images/cover/Python.png'
      }
    }
    
    if (newCoverPath !== resource.cover) {
      await prisma.resource.update({
        where: { id: resource.id },
        data: { cover: newCoverPath }
      })
      console.log(`修复资源 "${resource.title}" 封面路径: ${newCoverPath}`)
    } else {
      console.log(`资源 "${resource.title}" 封面路径已正确: ${newCoverPath}`)
    }
  }

  console.log('资源封面路径修复完成!')
}

async function main() {
  try {
    await fixResourceCovers()
  } catch (error) {
    console.error('修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
