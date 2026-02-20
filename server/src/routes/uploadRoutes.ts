import { Router } from 'express'
import { upload, uploadImage, deleteImage } from '../controllers/uploadController'

const router = Router()

// 上传图片
router.post('/image', upload.single('file'), uploadImage)

// 删除图片
router.delete('/image/:filename', deleteImage)

export default router
module.exports = router
