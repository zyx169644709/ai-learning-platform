import bcrypt from 'bcryptjs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient()

type Where = { username?: string; email?: string }

class UserModel {
  static async findOne(options: { where: Where }) {
    const { where } = options
    let user: any = null
    if (where.username) {
      user = await prisma.user.findUnique({ where: { username: where.username } })
    } else if (where.email) {
      user = await prisma.user.findUnique({ where: { email: where.email } })
    }
    if (!user) return null
    return Object.assign(user, attachMethods(user))
  }

  static async findByPk(id: number) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return Object.assign(user, attachMethods(user))
  }

  static async create(userData: { username: string; email: string; password: string }) {
    const { password, ...otherData } = userData
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { ...otherData, password: hashedPassword } })
    return Object.assign(user, attachMethods(user))
  }
}

function attachMethods(self: any) {
  return {
    toJSON() {
      const { password, ...rest } = self
      return rest
    },
    async validatePassword(password: string) {
      return await bcrypt.compare(password, self.password)
    },
    async update(updateData: Record<string, any>) {
      const { password, ...otherData } = updateData
      const dataToUpdate: Record<string, any> = { ...otherData }
      if (password) dataToUpdate.password = await bcrypt.hash(password, 10)
      const updated = await prisma.user.update({ where: { id: self.id }, data: dataToUpdate })
      Object.assign(self, updated)
      return self
    }
  }
}

export = UserModel


