// 集中数据库客户端（TypeScript 版本）
// 说明：保持与 JS 版本同等行为，并提供类型导出
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../generated/prisma')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const envConfig = require('./environment')

export const prisma = new PrismaClient({
  log: envConfig.isProduction ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: envConfig.database.url
    }
  }
})

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export function getDatabaseConfig() {
  return { provider: envConfig.database.provider, url: envConfig.database.url }
}

export async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

export async function disconnect() {
  await prisma.$disconnect()
}

module.exports = { prisma, getDatabaseConfig, testConnection, disconnect }


