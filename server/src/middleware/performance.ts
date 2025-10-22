import { Request, Response, NextFunction } from 'express'

// 性能监控中间件
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const { method, url } = req
    const { statusCode } = res
    
    // 记录慢查询 (>500ms)
    if (duration > 500) {
      console.warn(`🐌 慢查询: ${method} ${url} - ${statusCode} - ${duration}ms`)
    }
    
    // 记录所有请求的性能数据
    console.log(`📊 ${method} ${url} - ${statusCode} - ${duration}ms`)
  })
  
  next()
}

// 请求限流中间件
export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    
    const clientData = requests.get(clientId)
    
    if (!clientData || now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs })
      return next()
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      })
    }
    
    clientData.count++
    next()
  }
}

// 响应压缩中间件
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send
  
  res.send = function(data: any) {
    // 只压缩大于1KB的响应
    if (Buffer.isBuffer(data) && data.length > 1024) {
      res.setHeader('Content-Encoding', 'gzip')
    }
    return originalSend.call(this, data)
  }
  
  next()
}

// 缓存中间件
export const cacheMiddleware = (ttl: number = 300) => {
  const cache = new Map<string, { data: any; expires: number }>()
  
  return (req: Request, res: Response, next: NextFunction) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') {
      return next()
    }
    
    const key = `${req.method}:${req.originalUrl}`
    const cached = cache.get(key)
    
    if (cached && Date.now() < cached.expires) {
      return res.json(cached.data)
    }
    
    const originalSend = res.send
    res.send = function(data: any) {
      // 缓存成功的响应
      if (res.statusCode === 200) {
        cache.set(key, {
          data: JSON.parse(data),
          expires: Date.now() + ttl * 1000
        })
      }
      return originalSend.call(this, data)
    }
    
    next()
  }
}
