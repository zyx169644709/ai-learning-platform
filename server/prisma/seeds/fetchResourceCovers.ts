//npx tsx prisma/seeds/fetchResourceCovers.ts
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

// 通过 Microlink API 获取网站封面图（优先 og:image，降级 logo）
async function fetchCoverFromMicrolink(url: string): Promise<string | null> {
  if (url.startsWith('https://github.com')) {
    return 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
  }

  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const data = await res.json()

    if (data.status === 'success' || data.status === 'partial') {
      // 优先使用 og:image，其次使用 screenshot，最后用 logo
      const imageUrl =
        data.data?.image?.url ||
        data.data?.screenshot?.url ||
        data.data?.logo?.url ||
        null
      return imageUrl
    }

    console.error(`  Microlink 返回非成功状态 (${url}): status=${data.status}`)
    return null
  } catch (error) {
    console.error(`  请求失败 (${url}):`, error)
    return null
  }
}

// 延迟函数，避免请求过快触发限流
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchAndUpdateResourceCovers() {
  console.log('开始批量获取资源封面（Microlink API）...\n')

  // 获取所有没有封面、但有 URL 的已发布资源
  const resources = await prisma.resource.findMany({
    where: {
      url: { not: '' },
      OR: [
        { cover: null },
        { cover: '' }
      ]
    },
    select: { id: true, title: true, url: true, cover: true }
  })

  console.log(`找到 ${resources.length} 个需要获取封面的资源\n`)

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  for (const resource of resources) {
    if (!resource.url) {
      console.log(`✗ 无 URL，跳过: ${resource.title}`)
      skipCount++
      continue
    }

    console.log(`正在获取: ${resource.title}`)
    console.log(`  URL: ${resource.url}`)

    const coverUrl = await fetchCoverFromMicrolink(resource.url)

    if (coverUrl) {
      await prisma.resource.update({
        where: { id: resource.id },
        data: { cover: coverUrl }
      })
      console.log(`  ✓ 封面已更新: ${coverUrl.substring(0, 80)}`)
      successCount++
    } else {
      console.log(`  ✗ 未获取到封面，跳过`)
      failCount++
    }

    // 每次请求间隔 800ms，避免触发 Microlink 免费版限流（50次/天）
    await sleep(800)
  }

  console.log(`\n完成！成功: ${successCount} 个，失败: ${failCount} 个，跳过: ${skipCount} 个`)
}

fetchAndUpdateResourceCovers()
  .catch((e) => {
    console.error('脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
