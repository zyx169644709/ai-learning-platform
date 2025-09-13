// 生产环境配置示例
// 复制此文件为 production.js 并根据实际情况修改

module.exports = {
  // 数据库配置
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    // 免费云版 PostgreSQL 服务推荐：
    // 1. Supabase (https://supabase.com) - 免费额度：500MB 数据库，2GB 带宽
    // 2. Neon (https://neon.tech) - 免费额度：3GB 数据库，无限制连接
    // 3. Railway (https://railway.app) - 免费额度：$5/月
    // 4. PlanetScale (https://planetscale.com) - 免费额度：1GB 数据库
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    }
  },
  
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  
  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [],
    credentials: true
  },
  
  // 环境变量示例
  env: {
    // 数据库连接字符串
    DATABASE_URL: 'postgresql://username:password@host:port/database',
    
    // 数据库连接参数
    DB_HOST: 'your-db-host.com',
    DB_PORT: '5432',
    DB_USER: 'your_username',
    DB_PASSWORD: 'your_password',
    DB_NAME: 'your_database',
    DB_SSL: 'true',
    
    // JWT 密钥
    JWT_SECRET: 'your-super-secret-jwt-key-here',
    
    // CORS 允许的域名
    CORS_ORIGIN: 'https://yourdomain.com,https://www.yourdomain.com',
    
    // 服务器端口
    PORT: '3000'
  }
}

/*
部署步骤：

1. 选择免费云版 PostgreSQL 服务
   - 推荐 Supabase 或 Neon（免费额度较大）

2. 创建数据库并获取连接信息
   - 主机地址、端口、用户名、密码、数据库名

3. 设置环境变量
   - 在服务器上设置 DATABASE_URL 等环境变量

4. 运行生产环境迁移
   npm run db:setup:prod

5. 启动服务器
   NODE_ENV=production npm start
*/
