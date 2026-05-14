//npx tsx prisma/seeds/fetchBiliCovers.ts
import { PrismaClient } from '../../generated/prisma'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const prisma = new PrismaClient()
const uploadsDir = path.resolve(__dirname, '../../uploads')

type BiliInfo = {
  coverUrl: string
  duration: string
  description: string
  newUrl?: string  // 兜底时替换的新视频链接
}

const BILI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://www.bilibili.com'
}

// 从 BiliBili URL 提取 BV 号
function extractBV(url: string): string | null {
  const match = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

// 将 "H:MM:SS" 或 "MM:SS" 字符串解析为秒数（搜索结果用）
function parseDurationString(str: string): number {
  if (!str) return 0
  const parts = String(str).split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

// 将秒数格式化为中文时长字符串
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}小时${m > 0 ? m + '分钟' : ''}`
  if (m > 0) return `${m}分钟${s > 0 ? s + '秒' : ''}`
  return `${s}秒`
}

// 通过 BV 号获取视频完整信息
async function fetchBiliInfo(bv: string): Promise<BiliInfo | null> {
  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bv}`,
      { headers: BILI_HEADERS }
    )
    const data = await res.json()
    if (data.code === 0 && data.data?.pic) {
      const d = data.data
      return {
        coverUrl: d.pic,
        duration: formatDuration(d.duration),
        description: (d.desc || '').trim()
      }
    }
    console.error(`  API返回错误 (${bv}): code=${data.code}, message=${data.message}`)
    return null
  } catch (error) {
    console.error(`  获取信息失败 (${bv}):`, error)
    return null
  }
}

// 通过课程标题搜索相似视频作为兜底，同时替换课程链接（最多重试 3 次，退避等待）
async function searchBiliInfoByTitle(title: string, retryCount = 0): Promise<BiliInfo | null> {
  const MAX_RETRIES = 3
  try {
    const keyword = encodeURIComponent(title)
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${keyword}&page=1&page_size=1`,
      { headers: BILI_HEADERS }
    )
    const text = await res.text()

    // 检测到限流返回的 HTML 页面时触发重试
    if (text.trimStart().startsWith('<')) {
      if (retryCount < MAX_RETRIES) {
        const waitMs = 2000 * Math.pow(2, retryCount)  // 2s → 4s → 8s
        console.log(`  ↳ 搜索接口被限流，${waitMs / 1000}秒后重试 (${retryCount + 1}/${MAX_RETRIES})...`)
        await sleep(waitMs)
        return searchBiliInfoByTitle(title, retryCount + 1)
      }
      console.error(`  搜索兜底失败 (${title}): 达到最大重试次数，接口持续返回限流页面`)
      return null
    }

    const data = JSON.parse(text)
    const first = data?.data?.result?.[0]
    if (data.code === 0 && first?.pic) {
      const bvid = first.bvid as string
      const cleanTitle = (first.title as string).replace(/<[^>]+>/g, '')
      console.log(`  ↳ 搜索命中: 《${cleanTitle}》(${bvid})`)
      return {
        coverUrl: first.pic.startsWith('http') ? first.pic : `https:${first.pic}`,
        duration: formatDuration(parseDurationString(first.duration)),
        description: (first.description || '').trim(),
        newUrl: `https://www.bilibili.com/video/${bvid}`
      }
    }
    return null
  } catch (error) {
    console.error(`  搜索兜底失败 (${title}):`, error)
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
  console.log('开始批量获取 BiliBili 课程信息（封面 + 时长 + 简介）...\n')

  const courses = await prisma.course.findMany({
    where: { url: { contains: 'bilibili.com' } },
    select: { id: true, title: true, url: true, cover: true, duration: true, content: true }
  })

  console.log(`找到 ${courses.length} 个 BiliBili 课程\n`)

  let successCount = 0
  let fallbackCount = 0
  let failCount = 0

  // 缓存已知失效的 BV 号，避免重复请求 B站接口
  const invalidBvCache = new Set<string>()

  for (const course of courses) {
    const bv = extractBV(course.url)
    if (!bv) {
      console.log(`✗ 无法提取BV号: ${course.title}`)
      failCount++
      continue
    }

    // 封面、时长、简介均已存在则跳过
    if (course.cover && course.duration && course.content) {
      console.log(`  ⏭ 已有完整数据，跳过: ${course.title}`)
      continue
    }

    console.log(`正在获取: ${course.title} (${bv})`)

    let info: BiliInfo | null = null
    let isFallback = false

    if (invalidBvCache.has(bv)) {
      // 该 BV 已确认失效，直接进入搜索兜底，不再请求接口
      console.log(`  ↳ BV已知失效(缓存)，直接搜索相似课程...`)
    } else {
      info = await fetchBiliInfo(bv)
      if (!info) invalidBvCache.add(bv)
    }

    if (!info) {
      console.log(`  ↳ 尝试搜索相似课程兜底...`)
      await sleep(1200)  // 搜索前延长等待，避免触发限流
      info = await searchBiliInfoByTitle(course.title)
      isFallback = true
    }

    if (info) {
      const localCoverUrl = await saveRemoteCoverToUploads(info.coverUrl, 'course-cover', course.id)

      const updateData: any = {
        cover: localCoverUrl,
        ...(info.duration ? { duration: info.duration } : {}),
        ...(info.description ? { content: info.description } : {}),
        ...(isFallback && info.newUrl ? { url: info.newUrl } : {})
      }

      await prisma.course.update({ where: { id: course.id }, data: updateData })

      const updatedFields = [
        '封面',
        info.duration ? `时长(${info.duration})` : null,
        info.description ? '简介' : null,
        isFallback && info.newUrl ? '链接(已替换为相似课程)' : null
      ].filter(Boolean).join(' + ')

      console.log(`  ✓ 已更新: ${updatedFields}`)
      isFallback ? fallbackCount++ : successCount++
    } else {
      console.log(`  ✗ 获取失败，跳过`)
      failCount++
    }

    // 每次请求后延迟 500ms，避免触发限流
    await sleep(500)
  }

  console.log(`\n完成！原始成功: ${successCount} 个，搜索兜底: ${fallbackCount} 个，失败: ${failCount} 个`)
}

fetchAndUpdateCovers()
  .catch((e) => {
    console.error('脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
