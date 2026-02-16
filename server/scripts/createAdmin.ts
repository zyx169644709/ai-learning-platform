// 创建管理员账号脚本
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require('../src/models/userModel')

async function createAdmin() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } })
    
    if (existingAdmin) {
      console.log('管理员账号已存在')
      return
    }
    
    // 创建管理员账号
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: '123456', // 在生产环境中应该使用加密密码
      role: 'ADMIN'  // 使用正确的枚举值
    })
    
    console.log('管理员账号创建成功:', admin.email)
    console.log('用户名: admin')
    console.log('密码: 123456')
  } catch (error) {
    console.error('创建管理员失败:', error)
  }
  
  process.exit()
}

createAdmin()
