// Switch to Prisma-backed service (same style as community/course)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient()

export interface ResourceDTO {
  id?: string
  title: string
  description?: string
  url: string
  cover?: string
  tags?: any
}

export const resourceService = {
  async list() {
    return prisma.resource.findMany({ orderBy: { createdAt: 'desc' } })
  },

  async get(id: string) {
    return prisma.resource.findUnique({ where: { id } })
  },

  async create(input: ResourceDTO) {
    return prisma.resource.create({ data: input as any })
  },

  async update(id: string, input: Partial<ResourceDTO>) {
    return prisma.resource.update({ where: { id }, data: input as any })
  },

  async remove(id: string) {
    await prisma.resource.delete({ where: { id } })
    return true
  }
}


