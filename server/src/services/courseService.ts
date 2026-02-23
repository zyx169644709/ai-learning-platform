// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient()

export const courseService = {
  // 排除从 Markdown 导入的课程（ID 以 course- 开头）
  list: async () => prisma.course.findMany({
    where: {
      status: 'published',
      NOT: {
        id: { startsWith: 'course-' }
      }
    },
    orderBy: { createdAt: 'desc' }
  }),
  get: async (id: string) => prisma.course.findUnique({ where: { id } }),
  create: async (data: any) => prisma.course.create({ data }),
  update: async (id: string, data: any) => prisma.course.update({ where: { id }, data }),
  remove: async (id: string) => prisma.course.delete({ where: { id } })
}


