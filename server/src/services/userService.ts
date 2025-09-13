import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// 注意：services 位于 src/services，database.ts 位于 server/config
// 因此需要回退两级目录
import { prisma } from '../../config/database'

class UserService {
  async createUser(userData: { username: string; email: string; password: string; role?: string }) {
    const { username, email, password, role = 'USER' } = userData
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })
    if (existingUser) throw new Error('用户名或邮箱已存在')
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        userPreferences: {
          create: { theme: 'dark', codePanelRatio: 50, language: 'javascript', notifications: true }
        }
      },
      include: { userPreferences: true }
    })
    const { password: _pwd, ...userWithoutPassword } = user as any
    return userWithoutPassword
  }

  async loginUser(credentials: { username: string; password: string }) {
    const { username, password } = credentials
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
      include: { userPreferences: true }
    })
    if (!user) throw new Error('用户名或密码错误')
    const isValid = await bcrypt.compare(password, (user as any).password)
    if (!isValid) throw new Error('用户名或密码错误')
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '7d' })
    const { password: _pwd, ...userWithoutPassword } = user as any
    return { user: userWithoutPassword, token }
  }

  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPreferences: true,
        codeSnippets: { orderBy: { createdAt: 'desc' }, take: 10 },
        learningProgress: { orderBy: { updatedAt: 'desc' } }
      }
    })
    if (!user) throw new Error('用户不存在')
    const { password: _pwd, ...userWithoutPassword } = user as any
    return userWithoutPassword
  }

  async updateUser(userId: number, updateData: Record<string, any>) {
    const { password, ...otherData } = updateData
    if (password) (otherData as any).password = await bcrypt.hash(password, 10)
    const updated = await prisma.user.update({ where: { id: userId }, data: otherData, include: { userPreferences: true } })
    const { password: _pwd, ...userWithoutPassword } = updated as any
    return userWithoutPassword
  }

  async updateUserPreferences(userId: number, preferences: Record<string, any>) {
    return prisma.userPreferences.upsert({ where: { userId }, update: preferences, create: { userId, ...preferences } })
  }

  async deleteUser(userId: number) {
    await prisma.user.delete({ where: { id: userId } })
    return { message: '用户删除成功' }
  }

  async verifyToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here')
    } catch {
      throw new Error('Token 无效或已过期')
    }
  }
}

export default new UserService()
module.exports = new UserService()


