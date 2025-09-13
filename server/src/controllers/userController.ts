import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
// 维持与现有模型实现的一致性（CommonJS 导出）
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require('../models/userModel') as any

// JWT 密钥（应来自环境变量）
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'

// 注册
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as { username?: string; email?: string; password?: string }

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: '用户名、邮箱和密码不能为空' })
    }

    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' })
    }

    const existingEmail = await User.findOne({ where: { email } })
    if (existingEmail) {
      return res.status(400).json({ success: false, message: '邮箱已被注册' })
    }

    const user = await User.create({ username, email, password })

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ success: true, message: '注册成功', data: { user: user.toJSON(), token } })
  } catch (error: any) {
    console.error('注册错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 登录
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string }
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    }

    const user = await User.findOne({ where: { username } })
    if (!user) return res.status(400).json({ success: false, message: '用户名或密码错误' })

    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) return res.status(400).json({ success: false, message: '用户名或密码错误' })

    await user.update({ lastLoginAt: new Date() })

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    const updatedUser = await User.findByPk(user.id)
    res.json({ success: true, message: '登录成功', data: { user: updatedUser.toJSON(), token } })
  } catch (error: any) {
    console.error('登录错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取用户信息
export const getProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId
    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    res.json({ success: true, data: { user: user.toJSON() } })
  } catch (error: any) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 更新用户信息
export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId
    const { bio, avatar, username, email } = req.body as { bio?: string; avatar?: string; username?: string; email?: string }

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })

    const updateData: Record<string, any> = {}
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) {
      if (avatar && !avatar.startsWith('data:image/')) {
        return res.status(400).json({ success: false, message: '头像格式不正确' })
      }
      updateData.avatar = avatar
    }

    // 用户名更新：需要校验唯一性且与现值不同
    if (typeof username === 'string' && username.trim() && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } })
      if (existingUser) {
        return res.status(400).json({ success: false, message: '用户名已存在' })
      }
      updateData.username = username
    }

    // 邮箱更新：需要校验唯一性且与现值不同
    if (typeof email === 'string' && email.trim() && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } })
      if (existingEmail) {
        return res.status(400).json({ success: false, message: '邮箱已被注册' })
      }
      updateData.email = email
    }

    await user.update(updateData)
    const updatedUser = await User.findByPk(userId)
    res.json({ success: true, message: '更新成功', data: { user: updatedUser.toJSON() } })
  } catch (error: any) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message, error: error.message })
  }
}

// 修改密码
export const changePassword = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId
    const { oldPassword, newPassword } = req.body as { oldPassword?: string; newPassword?: string }

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })

    const isValidPassword = await user.validatePassword(oldPassword)
    if (!isValidPassword) return res.status(400).json({ success: false, message: '原密码错误' })

    await user.update({ password: newPassword })
    res.json({ success: true, message: '密码修改成功' })
  } catch (error: any) {
    console.error('修改密码错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 登出
export const logout = async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, message: '登出成功' })
  } catch (error: any) {
    console.error('登出错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 保持与 CommonJS 兼容
module.exports = { register, login, getProfile, updateProfile, changePassword, logout }


