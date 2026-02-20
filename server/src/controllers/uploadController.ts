import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `image-${uniqueSuffix}${ext}`)
  }
})

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 只允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'))
  }
}

// 创建 multer 实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制 2MB
  }
})

// 上传图片
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      })
    }

    // 构建图片 URL
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`

    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    })
  } catch (error: any) {
    console.error('上传图片错误:', error)
    res.status(500).json({
      success: false,
      message: '上传失败',
      error: error.message
    })
  }
}

// 删除图片
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: '文件名不能为空'
      })
    }

    const filePath = path.join(uploadDir, filename)
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    // 删除文件
    fs.unlinkSync(filePath)

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error: any) {
    console.error('删除图片错误:', error)
    res.status(500).json({
      success: false,
      message: '删除失败',
      error: error.message
    })
  }
}
