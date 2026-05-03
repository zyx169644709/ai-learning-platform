//npx tsx prisma/seeds/fetchBiliCovers.ts
import { PrismaClient } from '../../generated/prisma'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const prisma = new PrismaClient()
const uploadsDir = path.resolve(__dirname, '../../uploads')

// 从 BiliBili URL 提取 BV 号
function extractBV(url: string): string | null {
  const match = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

// 通过B站官方API获取视频封面
async function fetchBiliCover(bv: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bv}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com'
        }
      }
    )
    const data = await res.json()
    if (data.code === 0 && data.data?.pic) {
      return data.data.pic
    }
    console.error(`  API返回错误 (${bv}): code=${data.code}, message=${data.message}`)
    return null
  } catch (error) {
    console.error(`  获取封面失败 (${bv}):`, error)
    return null
  }
}

async function saveRemoteCoverToUploads(imageUrl: string, prefix: string, entityId: string) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`下载封面失败: ${response.status} ${response.statusText}`)
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

// 延迟函数，避免请求过快
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchAndUpdateCovers() {
  console.log('开始批量获取 BiliBili 课程封面...\n')

  const courses = await prisma.course.findMany({
    where: {
      url: { contains: 'bilibili.com' }
    },
    select: { id: true, title: true, url: true, cover: true }
  })

  console.log(`找到 ${courses.length} 个 BiliBili 课程\n`)

  let successCount = 0
  let failCount = 0

  for (const course of courses) {
    const bv = extractBV(course.url)
    if (!bv) {
      console.log(`✗ 无法提取BV号: ${course.title}`)
      failCount++
      continue
    }

    console.log(`正在获取: ${course.title} (${bv})`)
    const coverUrl = await fetchBiliCover(bv)

    if (coverUrl) {
      const localCoverUrl = await saveRemoteCoverToUploads(coverUrl, 'course-cover', course.id)
      await prisma.course.update({
        where: { id: course.id },
        data: { cover: localCoverUrl }
      })
      console.log(`  ✓ 封面已更新: ${localCoverUrl}`)
      successCount++
    } else {
      console.log(`  ✗ 获取封面失败，跳过`)
      failCount++
    }

    // 每次请求后延迟 300ms，避免触发限流
    await sleep(300)
  }

  console.log(`\n完成！成功: ${successCount} 个，失败: ${failCount} 个`)
}

fetchAndUpdateCovers()
  .catch((e) => {
    console.error('脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
