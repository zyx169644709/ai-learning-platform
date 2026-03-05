import { PrismaClient } from '../generated/prisma'
import * as readline from 'readline'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 生成简单的用户名
function generateUsername(index: number): string {
  return `user_${index}`
}

// 生成简单的邮箱
function generateEmail(username: string): string {
  return `${username}@example.com`
}

// 批量生成用户
async function generateUsers(count: number) {
  console.log(`\n开始生成 ${count} 个用户...\n`)

  const defaultPassword = await bcrypt.hash('123456', 10)
  let successCount = 0
  let failCount = 0

  for (let i = 1; i <= count; i++) {
    try {
      const username = generateUsername(i)
      const email = generateEmail(username)
      
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: defaultPassword,
          role: 'USER',
          status: 'active'
        }
      })

      successCount++
      console.log(`✓ [${i}/${count}] 创建用户: ${user.username} (${user.email})`)
    } catch (error: any) {
      failCount++
      console.error(`✗ [${i}/${count}] 创建失败: ${error.message}`)
    }
  }

  console.log(`\n生成完成！`)
  console.log(`成功: ${successCount} 个`)
  console.log(`失败: ${failCount} 个`)
  console.log(`\n默认密码: 123456\n`)
}

// 命令行交互
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('='.repeat(50))
  console.log('批量生成用户工具')
  console.log('='.repeat(50))

  rl.question('\n请输入要生成的用户数量: ', async (answer) => {
    const count = parseInt(answer)

    if (isNaN(count) || count <= 0) {
      console.log('❌ 请输入有效的数字！')
      rl.close()
      await prisma.$disconnect()
      return
    }

    if (count > 1000) {
      console.log('⚠️  警告: 生成数量较大，可能需要较长时间')
    }

    rl.question(`\n确认生成 ${count} 个用户？(y/n): `, async (confirm) => {
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        try {
          await generateUsers(count)
        } catch (error) {
          console.error('生成过程中出错:', error)
        } finally {
          rl.close()
          await prisma.$disconnect()
        }
      } else {
        console.log('已取消')
        rl.close()
        await prisma.$disconnect()
      }
    })
  })
}

main().catch((error) => {
  console.error('发生错误:', error)
  prisma.$disconnect()
  process.exit(1)
})
