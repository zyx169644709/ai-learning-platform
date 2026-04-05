import { seedResources } from './seeds/resourceSeeds'

async function main() {
  console.log('=== 开始执行数据库种子脚本 ===\n')
  await seedResources()
  console.log('\n=== 种子脚本执行完成 ===')
}

main()
  .catch((e) => {
    console.error('种子脚本执行失败:', e)
    process.exit(1)
  })
