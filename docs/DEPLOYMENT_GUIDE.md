# 部署和运维指南

## 概述

本文档详细说明AI学习平台的部署流程、环境配置、监控维护和故障排除等运维相关内容。支持开发、测试、生产等多环境部署。

## 系统要求

### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB可用空间
- **网络**: 100Mbps带宽

### 推荐配置
- **CPU**: 4核心或以上
- **内存**: 8GB RAM或以上
- **存储**: 50GB SSD
- **网络**: 1Gbps带宽

### 软件依赖
- **Node.js**: 20.x LTS或以上
- **npm**: 10.x或以上
- **数据库**: SQLite 3.x（开发）/ PostgreSQL 14+（生产）
- **反向代理**: Nginx 1.18+或Apache 2.4+
- **SSL证书**: Let's Encrypt或商业证书

## 环境配置

### 1. 开发环境

#### 环境变量配置

**前端环境变量** (`client/.env.local`):
```bash
# API配置
VITE_API_BASE=http://localhost:3000/api

# AI服务配置
VITE_ENABLE_DEEPSEEK=true
VITE_DEEPSEEK_API_BASE=https://api.deepseek.com/v1
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key

VITE_ENABLE_KIMI=false
VITE_KIMI_API_BASE=https://api.moonshot.cn/v1
VITE_KIMI_API_KEY=your_kimi_api_key

VITE_ENABLE_COZE=false
VITE_COZE_API_BASE=https://api.coze.cn/v1
VITE_COZE_API_KEY=your_coze_api_key

# 应用配置
VITE_APP_TITLE=AI学习平台
VITE_APP_VERSION=1.0.0
```

**后端环境变量** (`server/.env`):
```bash
# 服务器配置
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# 数据库配置
DATABASE_URL=file:./prisma/dev.db

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:5173

# AI服务配置
DEEPSEEK_API_KEY=your_deepseek_api_key
KIMI_API_KEY=your_kimi_api_key
COZE_API_KEY=your_coze_api_key

# 日志配置
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# 文件上传配置
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=uploads/
```

#### 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/your-org/ai-learning-platform.git
cd ai-learning-platform

# 2. 安装依赖
npm run install:all

# 3. 配置环境变量
cp client/.env.example client/.env.local
cp server/.env.example server/.env
# 编辑环境变量文件

# 4. 初始化数据库
npm run db:setup

# 5. 启动开发服务器
npm run dev
```

### 2. 生产环境

#### 环境变量配置

**前端环境变量** (`client/.env.production`):
```bash
VITE_API_BASE=https://api.yourdomain.com/api
VITE_ENABLE_DEEPSEEK=true
VITE_DEEPSEEK_API_BASE=https://api.deepseek.com/v1
VITE_DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
VITE_APP_TITLE=AI学习平台
VITE_APP_VERSION=1.0.0
```

**后端环境变量** (`server/.env.production`):
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# PostgreSQL配置
DATABASE_URL=postgresql://username:password@localhost:5432/ai_learning_platform

# JWT配置
JWT_SECRET=your_production_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=https://yourdomain.com

# AI服务配置
DEEPSEEK_API_KEY=your_production_deepseek_api_key
KIMI_API_KEY=your_production_kimi_api_key
COZE_API_KEY=your_production_coze_api_key

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/ai-learning-platform/app.log

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/uploads/ai-learning-platform/

# 安全配置
RATE_LIMIT_WINDOW=900000  # 15分钟
RATE_LIMIT_MAX=100        # 最大请求数
```

## 构建流程

### 1. 前端构建

```bash
# 进入前端目录
cd client

# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建结果在 dist/ 目录
```

**构建配置优化** (`client/vite.config.ts`):
```typescript
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          editor: ['monaco-editor']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 2. 后端构建

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 构建TypeScript
npm run build

# 构建结果在 dist/ 目录
```

**TypeScript配置** (`server/tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": false
  },
  "include": [
    "src/**/*",
    "server.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts"
  ]
}
```

## 部署方案

### 1. 传统服务器部署

#### Nginx配置

```nginx
# /etc/nginx/sites-available/ai-learning-platform
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # 前端静态文件
    location / {
        root /var/www/ai-learning-platform/client/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 文件上传大小限制
    client_max_body_size 10M;

    # 日志配置
    access_log /var/log/nginx/ai-learning-platform.access.log;
    error_log /var/log/nginx/ai-learning-platform.error.log;
}
```

#### PM2进程管理

**PM2配置文件** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [
    {
      name: 'ai-learning-platform-server',
      script: './server/dist/server.js',
      cwd: '/var/www/ai-learning-platform',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: '/var/log/pm2/ai-learning-platform.log',
      out_file: '/var/log/pm2/ai-learning-platform-out.log',
      error_file: '/var/log/pm2/ai-learning-platform-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
}
```

#### 部署脚本

**自动化部署脚本** (`scripts/deploy.sh`):
```bash
#!/bin/bash

set -e

# 配置变量
PROJECT_DIR="/var/www/ai-learning-platform"
BACKUP_DIR="/var/backups/ai-learning-platform"
GIT_REPO="https://github.com/your-org/ai-learning-platform.git"
BRANCH="main"

echo "🚀 开始部署AI学习平台..."

# 创建备份
echo "📦 创建备份..."
if [ -d "$PROJECT_DIR" ]; then
    sudo mkdir -p $BACKUP_DIR
    sudo cp -r $PROJECT_DIR $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)
fi

# 更新代码
echo "📥 更新代码..."
if [ ! -d "$PROJECT_DIR" ]; then
    sudo git clone $GIT_REPO $PROJECT_DIR
else
    cd $PROJECT_DIR
    sudo git fetch origin
    sudo git reset --hard origin/$BRANCH
fi

# 安装依赖
echo "📦 安装依赖..."
cd $PROJECT_DIR
sudo npm run install:all

# 构建前端
echo "🏗️ 构建前端..."
cd $PROJECT_DIR/client
sudo npm run build

# 构建后端
echo "🏗️ 构建后端..."
cd $PROJECT_DIR/server
sudo npm run build

# 数据库迁移
echo "🗄️ 数据库迁移..."
cd $PROJECT_DIR/server
sudo npm run db:setup:prod

# 重启服务
echo "🔄 重启服务..."
sudo pm2 reload ecosystem.config.js

# 清理旧备份（保留最近7天）
echo "🧹 清理旧备份..."
find $BACKUP_DIR -type d -name "backup-*" -mtime +7 -exec rm -rf {} +

echo "✅ 部署完成！"
```

### 2. Docker容器化部署

#### Dockerfile

**前端Dockerfile** (`client/Dockerfile`):
```dockerfile
# 多阶段构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY client/package*.json ./client/

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY client/ ./client/

# 构建应用
WORKDIR /app/client
RUN npm run build

# 生产镜像
FROM nginx:alpine

# 复制构建结果
COPY --from=builder /app/client/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

**后端Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache sqlite

# 复制package文件
COPY package*.json ./
COPY server/package*.json ./server/

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY server/ ./server/

# 构建应用
WORKDIR /app/server
RUN npm run build

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 创建必要目录
RUN mkdir -p /app/logs /app/uploads
RUN chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["node", "dist/server.js"]
```

#### Docker Compose

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: .
      dockerfile: client/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  # 后端服务
  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/ai_learning_platform
      - JWT_SECRET=your_production_jwt_secret
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL数据库
  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=ai_learning_platform
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

#### Docker部署脚本

**docker-deploy.sh**:
```bash
#!/bin/bash

set -e

# 配置变量
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="ai-learning-platform"

echo "🐳 开始Docker部署..."

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 构建镜像
echo "🏗️ 构建Docker镜像..."
docker-compose -f $COMPOSE_FILE build --no-cache

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose -f $COMPOSE_FILE down

# 启动新容器
echo "🚀 启动新容器..."
docker-compose -f $COMPOSE_FILE up -d

# 数据库迁移
echo "🗄️ 执行数据库迁移..."
docker-compose -f $COMPOSE_FILE exec backend npm run db:setup:prod

# 健康检查
echo "🏥 健康检查..."
sleep 30
docker-compose -f $COMPOSE_FILE ps

echo "✅ Docker部署完成！"
```

### 3. 云平台部署

#### Vercel部署（前端）

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.yourdomain.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "VITE_API_BASE": "https://api.yourdomain.com/api"
  }
}
```

#### Railway部署（后端）

**railway.toml**:
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[[services]]
name = "api"

[services.variables]
NODE_ENV = "production"
PORT = "3000"

[[services.ports]]
port = 3000
handlers = ["http"]
```

## 监控和日志

### 1. 应用监控

#### 健康检查端点

```typescript
// server/src/routes/health.ts
import { Router } from 'express'
import { prisma } from '../config/database'
import { aiServiceFactory } from '../services/aiService'

const router = Router()

router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now()
    
    // 数据库连接检查
    await prisma.$queryRaw`SELECT 1`
    const dbTime = Date.now() - startTime
    
    // AI服务检查
    const availableServices = aiServiceFactory.getAvailableServices()
    
    // 内存使用情况
    const memUsage = process.memoryUsage()
    
    // 系统信息
    const uptime = process.uptime()
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      database: {
        status: 'connected',
        responseTime: `${dbTime}ms`
      },
      services: {
        available: availableServices,
        total: ['deepseek', 'kimi', 'coze']
      },
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      },
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
```

#### 性能监控

```typescript
// server/src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express'

interface RequestMetrics {
  method: string
  url: string
  statusCode: number
  responseTime: number
  timestamp: Date
}

class MetricsCollector {
  private metrics: RequestMetrics[] = []
  private maxMetrics = 1000

  addMetric(metric: RequestMetrics) {
    this.metrics.push(metric)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(): RequestMetrics[] {
    return this.metrics
  }

  getStats() {
    const total = this.metrics.length
    if (total === 0) return null

    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / total
    const errorRate = this.metrics.filter(m => m.statusCode >= 400).length / total * 100

    return {
      totalRequests: total,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      lastMinute: this.metrics.filter(m => 
        Date.now() - m.timestamp.getTime() < 60000
      ).length
    }
  }
}

const metricsCollector = new MetricsCollector()

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    
    metricsCollector.addMetric({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date()
    })
  })
  
  next()
}

export { metricsCollector }
```

### 2. 日志管理

#### 日志配置

```typescript
// server/src/utils/logger.ts
import winston from 'winston'
import path from 'path'

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ai-learning-platform' },
  transports: [
    // 错误日志
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 所有日志
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

export default logger
```

#### 日志轮转

**logrotate配置** (`/etc/logrotate.d/ai-learning-platform`):
```
/var/log/ai-learning-platform/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
        pm2 reload ai-learning-platform-server
    endscript
}
```

### 3. 错误追踪

#### Sentry集成

```typescript
// server/src/config/sentry.ts
import * as Sentry from '@sentry/node'

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1
    })
  }
}

export const captureException = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context })
  }
}
```

## 备份策略

### 1. 数据库备份

#### 自动备份脚本

```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

# 配置变量
DB_NAME="ai_learning_platform"
DB_USER="postgres"
BACKUP_DIR="/var/backups/database"
DATE=$(date +%Y%m%d-%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# PostgreSQL备份
if command -v pg_dump &> /dev/null; then
    echo "📦 开始PostgreSQL备份..."
    pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/postgres-$DATE.sql.gz
    echo "✅ PostgreSQL备份完成: postgres-$DATE.sql.gz"
fi

# SQLite备份
if [ -f "prisma/dev.db" ]; then
    echo "📦 开始SQLite备份..."
    cp prisma/dev.db $BACKUP_DIR/sqlite-$DATE.db
    gzip $BACKUP_DIR/sqlite-$DATE.db
    echo "✅ SQLite备份完成: sqlite-$DATE.db.gz"
fi

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "🎉 数据库备份完成！"
```

#### 定时备份

```bash
# 添加到crontab
# 每天凌晨2点执行备份
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### 2. 文件备份

```bash
#!/bin/bash
# scripts/backup-files.sh

set -e

# 配置变量
PROJECT_DIR="/var/www/ai-learning-platform"
BACKUP_DIR="/var/backups/files"
DATE=$(date +%Y%m%d-%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份上传文件
if [ -d "$PROJECT_DIR/uploads" ]; then
    echo "📦 备份上传文件..."
    tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz -C $PROJECT_DIR uploads/
    echo "✅ 文件备份完成: uploads-$DATE.tar.gz"
fi

# 备份配置文件
echo "📦 备份配置文件..."
tar -czf $BACKUP_DIR/config-$DATE.tar.gz \
    $PROJECT_DIR/.env* \
    $PROJECT_DIR/ecosystem.config.js \
    $PROJECT_DIR/nginx.conf

# 清理旧备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "🎉 文件备份完成！"
```

## 安全配置

### 1. 防火墙配置

```bash
# UFW防火墙配置
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSL证书配置

```bash
# Let's Encrypt证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. 安全头配置

```nginx
# Nginx安全头
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;";
```

## 故障排除

### 1. 常见问题

#### 服务无法启动

```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 检查PM2状态
pm2 status
pm2 logs ai-learning-platform-server

# 检查系统资源
free -h
df -h
```

#### 数据库连接失败

```bash
# 检查数据库状态
sudo systemctl status postgresql

# 测试连接
psql -U postgres -h localhost -d ai_learning_platform

# 检查日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 前端访问异常

```bash
# 检查Nginx配置
sudo nginx -t
sudo systemctl reload nginx

# 检查SSL证书
sudo certbot certificates

# 查看访问日志
sudo tail -f /var/log/nginx/ai-learning-platform.access.log
```

### 2. 性能优化

#### 数据库优化

```sql
-- 创建索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_discussions_created_at ON discussions(created_at);
CREATE INDEX CONCURRENTLY idx_comments_discussion_id ON comments(discussion_id);

-- 分析查询性能
EXPLAIN ANALYZE SELECT * FROM discussions ORDER BY created_at DESC LIMIT 10;
```

#### 缓存配置

```typescript
// Redis缓存
import Redis from 'ioredis'

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
})

export const cacheService = {
  async get(key: string) {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  },
  
  async set(key: string, value: any, ttl: number = 300) {
    await redis.setex(key, ttl, JSON.stringify(value))
  },
  
  async del(key: string) {
    await redis.del(key)
  }
}
```

## 维护计划

### 1. 日常维护

- **每日**: 检查服务状态、查看错误日志、监控系统资源
- **每周**: 清理日志文件、检查备份完整性、更新安全补丁
- **每月**: 数据库性能分析、清理过期数据、更新依赖包

### 2. 监控指标

- **系统指标**: CPU使用率、内存使用率、磁盘空间、网络流量
- **应用指标**: 响应时间、错误率、并发用户数、API调用量
- **业务指标**: 用户注册数、内容发布数、AI服务使用量

### 3. 告警配置

```bash
# 配置邮件告警
# 当CPU使用率超过80%时发送告警
# 当磁盘空间不足20%时发送告警
# 当服务不可用时发送告警
```

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-06  
**维护团队**: AI Learning Platform Team
