import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

type EnvConfig = {
  database: {
    provider: 'sqlite' | 'postgresql'
    url?: string
    connection?: any
  }
  server: { port: number | string; host: string }
  jwt: { secret?: string; expiresIn: string }
  cors: { origin: string[]; credentials: boolean }
}

const config: Record<'development' | 'production' | 'test', EnvConfig> = {
  development: {
    database: {
      provider: 'sqlite',
      url: 'file:./dev.db',
      connection: { filename: path.join(__dirname, '../dev.db') }
    },
    server: { port: process.env.PORT || 3000, host: 'localhost' },
    jwt: { secret: process.env.JWT_SECRET || 'dev_jwt_secret_here', expiresIn: '7d' },
    cors: { origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }
  },
  production: {
    database: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
      connection: {
        host: process.env.DB_HOST,
        port: (process.env.DB_PORT as any) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
    },
    server: { port: process.env.PORT || 3000, host: '0.0.0.0' },
    jwt: { secret: process.env.JWT_SECRET, expiresIn: '7d' },
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || [], credentials: true }
  },
  test: {
    database: {
      provider: 'sqlite',
      url: 'file:./test.db',
      connection: { filename: path.join(__dirname, '../test.db') }
    },
    server: { port: 3001, host: 'localhost' },
    jwt: { secret: 'test_jwt_secret', expiresIn: '1h' },
    cors: { origin: ['http://localhost:5173'], credentials: true }
  }
}

const env = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development'

const validateAndFinalize = (cfg: EnvConfig): EnvConfig => {
  if (!cfg.jwt.secret) {
    if (env === 'production') throw new Error('环境变量 JWT_SECRET 未设置（生产环境必须提供一个强随机密钥）')
    cfg.jwt.secret = 'dev_jwt_secret_here'
  }
  if (cfg.database.provider === 'postgresql') {
    if (!cfg.database.url) throw new Error('环境变量 DATABASE_URL 未设置（生产环境需要 PostgreSQL 连接串）')
  } else if (cfg.database.provider === 'sqlite') {
    if (!cfg.database.url) cfg.database.url = 'file:./dev.db'
  }
  return cfg
}

const finalized = validateAndFinalize({ ...config[env] })

export = {
  ...finalized,
  env,
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  isTest: env === 'test'
}


