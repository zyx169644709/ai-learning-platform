/**
 * Markdown 文件导入脚本
 * 将 client/src/content/markdown 目录下的 md 文件导入到数据库
 * 章节独立管理，不创建课程关联
 * 
 * 使用方式：
 * npx ts-node --transpile-only scripts/importMarkdown.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

// Markdown 文件根目录
const MARKDOWN_ROOT = path.resolve(__dirname, '../../client/src/content/markdown')

// 章节配置文件路径
const CHAPTERS_CONFIG_PATH = path.resolve(__dirname, '../../client/src/content/chapters.ts')

// 章节分类名称映射
const CATEGORY_NAME_MAP: Record<string, string> = {
  'vue-basics': 'Vue 3 基础入门',
  'composition-api': 'Composition API 进阶',
  'components-deep': '深入组件系统',
  'routing-state': '路由与状态管理',
  'ecosystem': 'Vue 生态与工程化',
  'performance-testing': '性能优化与测试',
  'exercises': '专项习题练习',
  'practical-projects': '实战项目演练'
}

// 章节配置接口
interface TocNode {
  id: string
  title: string
  slug: string
  children?: TocNode[]
}

/**
 * 解析 chapters.ts 文件获取章节顺序配置
 */
function parseChaptersConfig(): TocNode[] {
  if (!fs.existsSync(CHAPTERS_CONFIG_PATH)) {
    console.log('  ⚠️ chapters.ts 配置文件不存在，使用默认顺序')
    return []
  }
  
  const content = fs.readFileSync(CHAPTERS_CONFIG_PATH, 'utf-8')
  
  // 简单解析：提取 export const chapters = [...] 部分
  const match = content.match(/export const chapters:\s*TocNode\[\]\s*=\s*(\[[\s\S]*?\n\])/)
  if (!match) {
    console.log('  ⚠️ 无法解析 chapters.ts，使用默认顺序')
    return []
  }
  
  try {
    // 使用 eval 解析（注意：生产环境应使用更安全的方式）
    const chaptersEval = new Function('return ' + match[1])()
    return chaptersEval
  } catch (e) {
    console.log('  ⚠️ 解析 chapters.ts 失败，使用默认顺序')
    return []
  }
}

/**
 * 从 Markdown 内容中提取标题
 */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : '未命名章节'
}

/**
 * 从 Markdown 内容中提取摘要（第一段非标题内容）
 */
function extractExcerpt(content: string): string {
  const lines = content.split('\n')
  let excerpt = ''
  let foundTitle = false
  
  for (const line of lines) {
    // 跳过标题行
    if (line.startsWith('#')) {
      foundTitle = true
      continue
    }
    // 跳过空行
    if (!line.trim()) continue
    // 找到第一个有内容的段落
    if (foundTitle && line.trim()) {
      excerpt = line.trim()
      // 限制长度
      if (excerpt.length > 200) {
        excerpt = excerpt.substring(0, 200) + '...'
      }
      break
    }
  }
  
  return excerpt || '暂无摘要'
}

/**
 * 导入章节和小节（层级结构）
 * 章节：Vue 3 基础入门
 * 小节：Vue 3 简介与环境搭建
 */
async function importChapters(
  categorySlug: string, 
  categoryTitle: string, 
  children: TocNode[] | undefined,
  categoryOrder: number
): Promise<number> {
  const categoryDir = path.join(MARKDOWN_ROOT, categorySlug)
  
  console.log(`\n📚 [${categoryOrder + 1}] 处理章节: ${categoryTitle}`)
  
  // 检查目录是否存在
  if (!fs.existsSync(categoryDir)) {
    console.log(`  ⚠️ 目录不存在: ${categoryDir}`)
    return 0
  }
  
  // 创建章节（父级）
  const chapterId = `chapter-${categorySlug}`
  const chapterOrder = categoryOrder + 1
  
  await prisma.chapter.upsert({
    where: { id: chapterId },
    create: {
      id: chapterId,
      title: categoryTitle,
      type: 'chapter',
      order: chapterOrder,
      status: 'published',
      parentId: null
    },
    update: {
      title: categoryTitle,
      type: 'chapter',
      order: chapterOrder
    }
  })
  
  console.log(`  ✅ 章节已创建: ${categoryTitle}`)
  
  let sectionCount = 0
  
  // 导入小节
  if (children && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const fileName = child.slug + '.md'
      const filePath = path.join(categoryDir, fileName)
      
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️ 文件不存在: ${fileName}`)
        continue
      }
      
      const content = fs.readFileSync(filePath, 'utf-8')
      const title = extractTitle(content)
      const excerpt = extractExcerpt(content)
      
      const sectionId = `section-${categorySlug}-${child.slug}`
      const sectionOrder = i + 1
      
      await prisma.chapter.upsert({
        where: { id: sectionId },
        create: {
          id: sectionId,
          title: child.title || title,
          content,
          excerpt,
          type: 'section',
          order: sectionOrder,
          status: 'published',
          parentId: chapterId
        },
        update: {
          title: child.title || title,
          content,
          excerpt,
          type: 'section',
          order: sectionOrder,
          parentId: chapterId
        }
      })
      
      console.log(`  📄 小节 [${i + 1}]: ${child.title}`)
      sectionCount++
    }
  } else {
    // 没有配置，按文件名排序导入
    const files = fs.readdirSync(categoryDir)
      .filter(f => f.endsWith('.md') && f !== 'index.md')
      .sort()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = path.join(categoryDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const title = extractTitle(content)
      const excerpt = extractExcerpt(content)
      
      const sectionId = `section-${categorySlug}-${file.replace('.md', '')}`
      const sectionOrder = i + 1
      
      await prisma.chapter.upsert({
        where: { id: sectionId },
        create: {
          id: sectionId,
          title,
          content,
          excerpt,
          type: 'section',
          order: sectionOrder,
          status: 'published',
          parentId: chapterId
        },
        update: {
          title,
          content,
          excerpt,
          type: 'section',
          order: sectionOrder,
          parentId: chapterId
        }
      })
      
      console.log(`  📄 小节 [${i + 1}]: ${title}`)
      sectionCount++
    }
  }
  
  return sectionCount
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始导入 Markdown 文件...\n')
  console.log(`📁 源目录: ${MARKDOWN_ROOT}`)
  console.log(`📋 配置文件: ${CHAPTERS_CONFIG_PATH}`)
  
  // 检查目录是否存在
  if (!fs.existsSync(MARKDOWN_ROOT)) {
    console.error('❌ Markdown 目录不存在！')
    console.log('请确保 client/src/content/markdown 目录存在')
    process.exit(1)
  }
  
  // 解析章节配置
  const chaptersConfig = parseChaptersConfig()
  
  if (chaptersConfig.length > 0) {
    console.log(`📖 使用 chapters.ts 配置顺序 (${chaptersConfig.length} 个分类)\n`)
    
    // 按配置顺序导入
    let totalChapters = 0
    for (let i = 0; i < chaptersConfig.length; i++) {
      const node = chaptersConfig[i]
      const count = await importChapters(node.slug, node.title, node.children, i)
      totalChapters += count
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`✨ 导入完成！`)
    console.log(`📊 成功导入: ${totalChapters} 个章节`)
    console.log('='.repeat(50))
  } else {
    // 没有配置，按目录名排序导入
    const categoryDirs = fs.readdirSync(MARKDOWN_ROOT, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort()
    
    console.log(`📂 发现 ${categoryDirs.length} 个分类目录（无配置文件，按目录名排序）\n`)
    
    let totalChapters = 0
    for (let i = 0; i < categoryDirs.length; i++) {
      const slug = categoryDirs[i]
      const title = CATEGORY_NAME_MAP[slug] || slug
      const count = await importChapters(slug, title, undefined, i)
      totalChapters += count
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`✨ 导入完成！`)
    console.log(`📊 成功导入: ${totalChapters} 个章节`)
    console.log('='.repeat(50))
  }
  
  await prisma.$disconnect()
}

// 执行
main().catch((e) => {
  console.error('❌ 导入失败:', e)
  process.exit(1)
})
