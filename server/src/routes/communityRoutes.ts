import { Router } from 'express'
import {
  getDiscussions,
  createDiscussion,
  getDiscussionById,
  createComment,
  likeDiscussion,
  likeComment
} from '../controllers/communityController'

const router = Router()

// 获取所有讨论帖子
router.get('/', getDiscussions)

// 创建新讨论帖子
router.post('/', createDiscussion)

// 获取单个讨论帖子详情
router.get('/:id', getDiscussionById)

// 创建评论
router.post('/:discussionId/comments', createComment)

// 点赞讨论帖子
router.post('/:id/like', likeDiscussion)

// 点赞评论
router.post('/comments/:id/like', likeComment)

module.exports = router
