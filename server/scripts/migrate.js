#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

const env = process.env.NODE_ENV || 'development'

console.log(`🚀 开始数据库迁移 (环境: ${env})`)

try {
  if (env === 'development') {
    // 开发环境：使用 SQLite
    console.log('📱 开发环境：使用 SQLite')
    
    // 重置数据库（开发环境）
    console.log('🔄 重置开发数据库...')
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
    
    // 创建迁移
    console.log('📝 创建数据库迁移...')
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
    
    // 生成 Prisma 客户端
    console.log('🔧 生成 Prisma 客户端...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
  } else {
    // 生产环境：使用 PostgreSQL
    console.log('☁️ 生产环境：使用 PostgreSQL')
    
    // 部署迁移
    console.log('🚀 部署生产数据库迁移...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // 生成 Prisma 客户端
    console.log('🔧 生成 Prisma 客户端...')
    execSync('npx prisma generate', { stdio: 'inherit' })
  }
  
  console.log('✅ 数据库迁移完成！')
  
} catch (error) {
  console.error('❌ 数据库迁移失败:', error.message)
  process.exit(1)
}
