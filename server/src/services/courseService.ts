// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient()

export const courseService = {
  list: async () => prisma.course.findMany({ orderBy: { createdAt: 'desc' } }),
  get: async (id: string) => prisma.course.findUnique({ where: { id } }),
  create: async (data: any) => prisma.course.create({ data }),
  update: async (id: string, data: any) => prisma.course.update({ where: { id }, data }),
  remove: async (id: string) => prisma.course.delete({ where: { id } })
}


