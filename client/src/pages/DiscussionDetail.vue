<template>
  <div class="discussion-detail-page">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧帖子内容 -->
      <div class="post-content">
        <!-- 返回按钮 -->
        <div class="back-section">
          <button @click="goBack" class="back-btn">
            <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            返回社区
          </button>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="discussion" class="post-card">
          <!-- 帖子头部 -->
          <div class="post-header">
            <!-- 标题区域 -->
            <div class="title-section">
              <h1 class="post-title">{{ discussion.title }}</h1>
              <div class="title-decoration"></div>
            </div>
            
            
          </div>

          <!-- 帖子内容 -->
          <div class="post-body">
            <div class="content-wrapper">
              <div class="post-text">{{ discussion.content }}</div>
            </div>
          </div>

          <!-- 帖子操作 -->
          <div class="post-actions">
            <div class="action-group primary-actions">
              <button @click="toggleLike" :class="{ liked: discussion.isLiked }" class="action-btn like-btn">
                <div class="btn-icon-wrapper">
                  <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                  </svg>
                </div>
                <span class="btn-text">{{ discussion.likes }}</span>
              </button>
              <button @click="toggleComments" class="action-btn comment-btn">
                <div class="btn-icon-wrapper">
                  <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <span class="btn-text">{{ discussion.replies }}</span>
              </button>
            </div>
            <div class="action-group secondary-actions">
              <button @click="sharePost" class="action-btn share-btn">
                <div class="btn-icon-wrapper">
                  <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                </div>
                <span class="btn-text">分享</span>
              </button>
            </div>
          </div>

          <!-- 评论区域 -->
          <div v-if="showComments" class="comments-section">
            <h3>评论 ({{ discussion.comments?.length || 0 }})</h3>
            
            <!-- 发表评论 -->
            <div class="comment-form">
              <div class="comment-input-wrapper">
                <textarea ref="commentTextareaRef" v-model="newComment" placeholder="写下你的评论..." rows="3" class="comment-textarea"></textarea>
                <button @click="submitComment" class="comment-submit-btn">
                  <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  发表评论
                </button>
              </div>
            </div>
            
            <!-- 评论列表 -->
            <div class="comments-list">
              <div v-for="comment in discussion.comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <div class="comment-avatar-wrapper">
                    <img :src="comment.authorInfo?.avatar || comment.authorAvatar || '/assets/images/default.png'" :alt="comment.authorInfo?.username || comment.author" class="comment-avatar" />
                  </div>
                  <div class="comment-info">
                    <span class="comment-author">{{ comment.authorInfo?.username || comment.author }}</span>
                    <span class="comment-time">{{ comment.time }}</span>
                  </div>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <div class="comment-actions">
                  <button @click="toggleCommentLike(comment)" :class="{ liked: comment.isLiked }" class="comment-action">
                    <svg class="comment-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                    </svg>
                    {{ comment.likes }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="error">
          <div class="error-icon">⚠️</div>
          <p>帖子不存在或已被删除</p>
          <button @click="goBack" class="back-btn">返回社区</button>
        </div>
      </div>

      <!-- 右侧作者信息 -->
      <div class="sidebar">
        <div v-if="discussion" class="author-card">
          <div class="author-header">
            <div class="author-avatar-wrapper">
              <img :src="discussion.authorInfo?.avatar || discussion.authorAvatar || '/assets/images/default.png'" :alt="discussion.authorInfo?.username || discussion.author" class="author-avatar" />
              <div class="online-indicator"></div>
            </div>
            <div class="author-info">
              <h3>{{ discussion.authorInfo?.username || discussion.author }}</h3>
              <p class="author-role">社区成员</p>
              <p class="author-join-date">加入于 {{ discussion.authorInfo?.joinDate || '未知时间' }}</p>
            </div>
          </div>
          
          <!-- 用户简介 -->
          <div v-if="discussion.authorInfo?.bio" class="author-bio">
            <p>{{ discussion.authorInfo.bio }}</p>
          </div>
          
          <div class="author-stats">
            <div class="stat-item">
              <span class="stat-number">{{ discussion.likes }}</span>
              <span class="stat-label">获赞</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ discussion.replies }}</span>
              <span class="stat-label">评论</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ discussion.views }}</span>
              <span class="stat-label">浏览</span>
            </div>
          </div>
        </div>

        <!-- 相关帖子推荐 -->
        <div class="related-posts">
          <h3 style="border-bottom: 1px solid var(--border-color);padding-bottom: 12px;">相关帖子</h3>
          <div v-for="relatedPost in relatedPosts" :key="relatedPost.id" class="related-item" @click.stop.prevent="goToPost(relatedPost.id)">
            <div class="related-meta">
              <span class="related-category">{{ categoryText(relatedPost.category) }}</span>
              <span class="related-time">{{ relatedPost.time }}</span>
            </div>
            <h4 class="related-title">{{ relatedPost.title }}</h4>
            <div class="related-stats">
              <div class="related-stat">
                <svg class="related-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                {{ relatedPost.views }}
              </div>
              <div class="related-stat">
                <svg class="related-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                {{ relatedPost.replies }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { 
  getDiscussionById, 
  createComment, 
  likeDiscussion, 
  likeComment,
  getDiscussions,
  type Discussion,
  type Comment,
  type CreateCommentData
} from '@/services/communityService'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const discussion = ref<Discussion | null>(null)
const loading = ref(false)
const showComments = ref(true)
const newComment = ref('')
const relatedPosts = ref<Discussion[]>([])
const commentTextareaRef = ref<HTMLTextAreaElement | null>(null)

const categoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    tech: '技术讨论',
    experience: '学习心得',
    project: '项目分享',
    help: '问题求助'
  }
  return categoryMap[category] || category
}

// 加载帖子详情
const loadDiscussion = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    const data = await getDiscussionById(id)
    console.log('加载的帖子数据:', data)
    console.log('authorInfo:', data.authorInfo)
    discussion.value = data
  } catch (error) {
    console.error('加载帖子详情失败:', error)
    discussion.value = null
  } finally {
    loading.value = false
  }
}

// 加载相关帖子
const loadRelatedPosts = async () => {
  try {
    const data = await getDiscussions(discussion.value?.category, undefined)
    console.log('获取的相关帖子数据:', data)
    // 过滤掉当前帖子，取前3个作为相关帖子
    relatedPosts.value = data
      .filter(post => post.id !== discussion.value?.id)
      .slice(0, 3)
    console.log('过滤后的相关帖子:', relatedPosts.value)
  } catch (error) {
    console.error('加载相关帖子失败:', error)
  }
}

// 切换点赞
const toggleLike = async () => {
  if (!discussion.value) return
  
  try {
    const result = await likeDiscussion(discussion.value.id)
    discussion.value.likes = result.likes
    discussion.value.isLiked = !discussion.value.isLiked
  } catch (error) {
    console.error('点赞失败:', error)
    alert('点赞失败，请稍后重试')
  }
}

// 切换评论显示
const toggleComments = async () => {
  showComments.value = true
  await nextTick()
  commentTextareaRef.value?.focus()
  commentTextareaRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// 切换评论点赞
const toggleCommentLike = async (comment: Comment) => {
  try {
    const result = await likeComment(comment.id)
    comment.likes = result.likes
    comment.isLiked = !comment.isLiked
  } catch (error) {
    console.error('点赞评论失败:', error)
    alert('点赞评论失败，请稍后重试')
  }
}

// 发表评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('请输入评论内容')
    return
  }

  if (!discussion.value) return

  // 检查用户是否已登录
  if (!userStore.isLogin || !userStore.userInfo) {
    alert('请先登录后再发表评论')
    return
  }

  try {
    const data: CreateCommentData = {
      content: newComment.value,
      author: userStore.userInfo.username
    }
    
    const newCommentData = await createComment(discussion.value.id, data)
    
    if (!discussion.value.comments) {
      discussion.value.comments = []
    }
    
    discussion.value.comments.push(newCommentData)
    discussion.value.replies++
    newComment.value = ''
    
    alert('评论发表成功！')
  } catch (error) {
    console.error('发表评论失败:', error)
    alert('发表评论失败，请稍后重试')
  }
}

// 分享帖子
const sharePost = () => {
  if (navigator.share) {
    navigator.share({
      title: discussion.value?.title,
      text: discussion.value?.excerpt,
      url: window.location.href
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制到剪贴板')
    })
  }
}

// 跳转到其他帖子（SPA 内部跳转）
const goToPost = (id: string) => {
  if (!id || id === discussion.value?.id) return
  router.push(`/discussion/${id}`)
}

// 返回社区
const goBack = () => {
  router.push('/community')
}


// 组件挂载与路由变化时加载数据
onMounted(async () => {
  await loadDiscussion()
  await loadRelatedPosts()
})

watch(
  () => route.params.id,
  async () => {
    await loadDiscussion()
    await loadRelatedPosts()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
)
</script>

<style scoped>
.discussion-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  color: var(--text-primary);
  padding: 0;
  width: 100%;
  margin: 0;
}

/* 返回按钮区域 */
.back-section {
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  margin: -24px -24px 0 -24px;
  border-radius: 16px 0 0 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 184, 131, 0.3);
}

.back-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
  transform: translateX(-2px);
}

/* 主要内容区域 */
.main-content {
  display: flex;
  gap: 24px;
  width: 100%;
  padding: 24px;
  min-height: calc(100vh - 80px);
  box-sizing: border-box;
  margin-left: -300px;
}

/* 左侧内容区域 */
.post-content {
  flex: 7;
  min-width: 0; 
  background: var(--bg-primary);
  border-radius: 16px 0 0 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  overflow: auto; 
  position: relative; 

}
.post-content::after {
  content: "";
  position: sticky;
  bottom: 0; 
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--border-color);
  z-index: 1;
}
/* 右侧边栏 */
.sidebar {
  flex: 3;
  min-width: 0; /* 防止内容溢出 */
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.post-card {
  padding: 0;
}

.post-header {
  margin-bottom: 40px;
  position: relative;
}

/* 标题区域 */
.title-section {
  position: relative;
  margin: 32px 0;
}

.post-title {
  font-size: 36px;
  font-weight: 900;
  margin: 0 0 16px 0;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 2;
}

.title-decoration {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color), transparent);
  border-radius: 2px;
  z-index: 1;
}

/* 统计信息 */
.post-stats {
  display: flex;
  gap: 20px;
  margin-top: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}


.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent-color), #3ca677);
  border-radius: 10px;
  position: relative;
  z-index: 2;
}

.stat-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  z-index: 2;
}

.stat-number {
  font-weight: 800;
  font-size: 18px;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-body {
  margin-bottom: 40px;
}

.content-wrapper {
  position: relative;
}

.post-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  font-size: 17px;
  line-height: 1.8;
  margin: 0;
  color: var(--text-primary);
  background: var(--bg-secondary);
  padding: 32px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  max-width: 100%;
  overflow-wrap: break-word;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.post-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--accent-color), transparent);
  border-radius: 16px 0 0 16px;
}



@keyframes progressAnimation {
  0%, 100% { width: 30%; }
  50% { width: 70%; }
}



.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 24px 0;
  border-top: 2px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.action-group {
  display: flex;
  gap: 12px;
}

.primary-actions {
  flex: 1;
}

.secondary-actions {
  margin-left: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(66, 184, 131, 0.3);
}

.action-btn.liked {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
  box-shadow: 0 4px 16px rgba(66, 184, 131, 0.4);
}

.btn-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  position: relative;
  z-index: 2;
}

.action-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.action-btn:hover .action-icon {
  transform: scale(1.1);
}

.btn-text {
  position: relative;
  z-index: 2;
  font-weight: 600;
}

/* 评论区域 */
.comments-section {
  border-top: 2px solid var(--border-color);
  padding-top: 32px;
}

.comments-section h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.comment-form {
  margin-bottom: 32px;
}

.comment-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 12px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.comment-submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-end;
  padding: 12px 24px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.comment-submit-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

.submit-icon {
  width: 16px;
  height: 16px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  background: var(--bg-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-avatar-wrapper {
  position: relative;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
}

.comment-avatar-wrapper:hover .comment-avatar {
  border-color: var(--accent-color);
  transform: scale(1.05);
}

.comment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-author {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 14px;
}

.comment-time {
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
}

.comment-content {
  color: var(--text-primary);
  line-height: 1.7;
  margin-bottom: 12px;
  font-size: 14px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.comment-action:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.comment-action.liked {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}

.comment-action-icon {
  width: 14px;
  height: 14px;
}

/* 右侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.author-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px 24px 0 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.author-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.author-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.author-avatar-wrapper {
  position: relative;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  transition: all 0.3s ease;
}

.author-avatar-wrapper:hover .author-avatar {
  border-color: var(--accent-color);
  transform: scale(1.05);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: #10b981;
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--accent-color);
}

.author-info h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.author-role {
  margin: 0 0 4px 0;
  color: var(--text-tertiary);
  font-size: 14px;
  font-weight: 500;
}

.author-join-date {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 400;
}

.author-bio {
  margin: 16px 0;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.author-bio p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  font-style: italic;
}

.author-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);

}

.stat-item {
  text-align: center;
  transition: all 0.3s ease;
}



.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.related-posts {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.related-posts h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.related-item {
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: -10px -8px 16px -8px;
  padding: 16px 8px;
  pointer-events: auto;
  user-select: none;
}

.related-item:last-child {
  border-bottom: none;
}

.related-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.related-category {
  font-size: 11px;
  color: var(--accent-color);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 4px;
}

.related-time {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.related-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
}

.related-stats {
  display: flex;
  gap: 16px;
}

.related-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.related-stat-icon {
  width: 14px;
  height: 14px;
}

/* 活动日历样式 */
.activity-calendar {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.activity-calendar h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.activity-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
}

.activity-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.activity-item:hover {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px;
  margin: 0 -12px 16px -12px;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-meta span:first-child {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.activity-meta span:last-child {
  font-size: 11px;
  color: var(--accent-color);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 4px;
}

.activity-item h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
}

.activity-item p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 加载和错误状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 60px 40px;
  color: var(--text-primary);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    padding: 20px;
  }
  
  .post-title {
    font-size: 32px;
  }
  
  .post-stats {
    gap: 16px;
  }
  
  .stat-item {
    padding: 14px 16px;
  }
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  
  .sidebar {
    order: -1;
  }
  
  .post-content,
  .sidebar {
    flex: none;
  }
  
  .post-title {
    font-size: 28px;
  }
  
  .author-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .post-stats {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .stat-item {
    flex: 1;
    min-width: 140px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .post-card {
    padding: 20px;
  }
  
  .post-title {
    font-size: 24px;
  }
  
  .back-section {
    padding: 16px 20px;
  }
  
  .post-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-group {
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
  
  .post-text {
    padding: 24px;
    font-size: 16px;
  }
  
  .author-bar {
    padding: 12px 16px;
  }
  
  .stat-item {
    padding: 12px 14px;
  }
  
  .stat-icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .stat-icon {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .post-title {
    font-size: 20px;
  }
  
  .post-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    justify-content: center;
    padding: 16px;
  }
  
  .post-text {
    padding: 20px;
    font-size: 15px;
  }
  
  .action-btn {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .author-bar {
    padding: 10px 12px;
  }
  
  .author-avatar-mini img {
    width: 36px;
    height: 36px;
  }
  
  .badge {
    padding: 6px 12px;
    font-size: 10px;
  }
}
</style>

