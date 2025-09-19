#!/usr/bin/env ts-node

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function checkResources() {
  console.log('检查资源数据...')
  
  const resources = await prisma.resource.findMany()
  
  console.log(`找到 ${resources.length} 个资源:`)
  resources.forEach(r => {
    console.log(`- ${r.title}: ${r.cover || '无封面'}`)
  })
  
  await prisma.$disconnect()
}

checkResources().catch(console.error)
