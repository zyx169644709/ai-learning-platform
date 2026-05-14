//npx tsx prisma/seeds/fetchResourceCovers.ts
import { PrismaClient } from '../../generated/prisma'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const prisma = new PrismaClient()
const uploadsDir = path.resolve(__dirname, '../../uploads')

// 延迟函数，避免请求过快触发限流
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 通过 Microlink API 获取网站封面图（优先 og:image，降级 logo），最多重试 3 次
async function fetchCoverFromMicrolink(url: string, retryCount = 0): Promise<string | null> {
  const MAX_RETRIES = 3

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
  } catch (error: any) {
    const isNetworkError = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error?.cause?.code)
    if (isNetworkError && retryCount < MAX_RETRIES) {
      const waitMs = 2000 * Math.pow(2, retryCount)  // 2s → 4s → 8s
      console.log(`  ↳ 网络错误(${error?.cause?.code})，${waitMs / 1000}秒后重试 (${retryCount + 1}/${MAX_RETRIES})...`)
      await sleep(waitMs)
      return fetchCoverFromMicrolink(url, retryCount + 1)
    }
    console.error(`  请求失败 (${url}):`, error)
    return null
  }
}

async function saveRemoteCoverToUploads(imageUrl: string, prefix: string, entityId: string) {
  let response: Response
  try {
    response = await fetch(imageUrl)
  } catch (error: any) {
    throw new Error(`下载封面网络错误: ${error?.cause?.code || error?.message}`)
  }
  if (!response!.ok) {
    throw new Error(`下载封面失败: ${response!.status} ${response!.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const parsedUrl = new URL(imageUrl)
  const extFromPath = path.extname(parsedUrl.pathname)
  const contentType = response.headers.get('content-type') || ''
  const ext = extFromPath || (contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg')
  const fileName = `${prefix}-${entityId}${ext}`

  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, fileName), buffer)

  return `/uploads/${fileName}`
}

async function fetchAndUpdateResourceCovers() {
  console.log('开始批量获取资源封面（Microlink API）...\n')

  const resources = await prisma.resource.findMany({
    where: {
      url: { not: '' }
    },
    select: { id: true, title: true, url: true, cover: true }
  })

  console.log(`找到 ${resources.length} 个候选资源\n`)

  let successCount = 0
  let deleteCount = 0
  let skipCount = 0

  for (const resource of resources) {
    if (!resource.url) {
      console.log(`✗ 无 URL，跳过: ${resource.title}`)
      skipCount++
      continue
    }

    if (resource.cover) {
      console.log(`  ⏭ 已有封面数据，跳过: ${resource.title}`)
      skipCount++
      continue
    }

    console.log(`正在获取: ${resource.title}`)
    console.log(`  URL: ${resource.url}`)

    const coverUrl = await fetchCoverFromMicrolink(resource.url)

    if (coverUrl) {
      try {
        const localCoverUrl = await saveRemoteCoverToUploads(coverUrl, 'resource-cover', resource.id)
        await prisma.resource.update({
          where: { id: resource.id },
          data: { cover: localCoverUrl }
        })
        console.log(`  ✓ 封面已更新: ${localCoverUrl}`)
        successCount++
      } catch (error: any) {
        console.error(`  ✗ 下载封面失败，删除资源: ${error.message}`)
        await prisma.resource.delete({ where: { id: resource.id } })
        deleteCount++
      }
    } else {
      console.log(`  ✗ 未获取到封面，删除资源`)
      await prisma.resource.delete({ where: { id: resource.id } })
      deleteCount++
    }

    // 每次请求间隔 800ms，避免触发 Microlink 免费版限流（50次/天）
    await sleep(800)
  }

  console.log(`\n完成！成功: ${successCount} 个，已删除: ${deleteCount} 个，跳过: ${skipCount} 个`)
}

fetchAndUpdateResourceCovers()
  .catch((e) => {
    console.error('脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
