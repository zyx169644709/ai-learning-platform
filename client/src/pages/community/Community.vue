<template>
  <div class="docs">
    <h1 class="title">社区</h1>
    <div class="main-container">
      <!-- 发帖按钮 -->
      <div class="post-actions">
        <button @click="showPostForm = true" class="post-btn">
          ✏️ 发布新帖
        </button>
      </div>

      <!-- 发帖表单 -->
      <div v-if="showPostForm" class="post-form">
        <h3>发布新帖</h3>
        <div class="form-group">
          <label>标题</label>
          <input v-model="newPost.title" type="text" placeholder="请输入帖子标题..." />
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="newPost.category">
            <option value="tech">技术讨论</option>
            <option value="experience">学习心得</option>
            <option value="project">项目分享</option>
            <option value="help">问题求助</option>
          </select>
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea v-model="newPost.content" placeholder="请输入帖子内容..." rows="6"></textarea>
        </div>
        <div class="form-actions">
          <button @click="submitPost" class="submit-btn">发布</button>
          <button @click="cancelPost" class="cancel-btn">取消</button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <p>加载中...</p>
      </div>

      <div v-else class="grid">
        <div class="card" v-for="d in filtered" :key="d.id" @click="viewDiscussion(d)">
          <span v-if="d.isPinned" class="pin-badge">📌 置顶</span>
          <div class="meta">
            <div class="row top">


            </div>
            <div class="c-title">{{ d.title }}</div>
            <div class="c-desc">{{ d.excerpt }}</div>
            <div class="row bottom">
              <span class="author"><img class="avatar"
                  :src="d.authorInfo?.avatar || d.authorAvatar || '/src/assets/images/default.png'" alt="" /> {{
                    d.authorInfo?.username || d.author }}</span>

            </div>
            <div class="row bottom">
              <div class="stats">
                <span class="stat">👁 {{ d.views }}</span>
                <span class="stat">💬 {{ d.replies }}</span>
                <span class="stat">👍 {{ d.likes }}</span>
                <span class="badge" :class="d.category">{{ categoryText(d.category) }}</span>

              </div>
              <span class="time">{{ d.time }}</span>
            </div>

          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import {
  getDiscussions,
  createDiscussion,
  getDiscussionById,
  createComment,
  likeDiscussion,
  likeComment,
  type Discussion,
  type Comment,
  type CreateDiscussionData,
  type CreateCommentData
} from '@/services/communityService'

type Category = 'tech' | 'experience' | 'project' | 'help'

const router = useRouter()
const userStore = useUserStore()

const query = ref('')
const selectedCategory = ref('all')
const showPostForm = ref(false)
const newPost = ref({
  title: '',
  content: '',
  category: 'tech' as Category
})

const discussions = ref<Discussion[]>([])
const loading = ref(false)

// 分类选项
const categoryOptions = [
  { value: 'all', label: '全部' },
  { value: 'tech', label: '技术讨论' },
  { value: 'experience', label: '学习心得' },
  { value: 'project', label: '项目分享' },
  { value: 'help', label: '问题求助' }
]

const filtered = computed(() => {
  return discussions.value
})

const categoryText = (c: Category) => ({ tech: '技术讨论', experience: '学习心得', project: '项目分享', help: '问题求助' }[c])

// 加载讨论帖子
const loadDiscussions = async () => {
  try {
    loading.value = true
    const data = await getDiscussions(selectedCategory.value === 'all' ? undefined : selectedCategory.value, query.value || undefined)
    discussions.value = data
  } catch (error) {
    console.error('加载讨论帖子失败:', error)
    alert('加载讨论帖子失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 社区功能函数
const viewDiscussion = (discussion: Discussion) => {
  // 直接跳转到帖子详情页面
  router.push(`/discussion/${discussion.id}`)
}


const submitPost = async () => {
  if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
    alert('请填写标题和内容')
    return
  }

  // 检查用户是否已登录
  if (!userStore.isLogin || !userStore.userInfo) {
    alert('请先登录后再发布帖子')
    return
  }

  try {
    const data: CreateDiscussionData = {
      title: newPost.value.title,
      content: newPost.value.content,
      category: newPost.value.category,
      author: userStore.userInfo.username
    }

    const newDiscussion = await createDiscussion(data)
    discussions.value.unshift(newDiscussion)

    // 重置表单
    newPost.value = {
      title: '',
      content: '',
      category: 'tech'
    }
    showPostForm.value = false

    alert('帖子发布成功！')
  } catch (error) {
    console.error('发布帖子失败:', error)
    alert('发布帖子失败，请稍后重试')
  }
}

const cancelPost = () => {
  newPost.value = {
    title: '',
    content: '',
    category: 'tech'
  }
  showPostForm.value = false
}


// 搜索和筛选
const handleSearch = () => {
  loadDiscussions()
}

const handleCategoryChange = () => {
  loadDiscussions()
}

// 组件挂载时加载数据
onMounted(() => {
  loadDiscussions()
})

const noop = () => { }
</script>

<style scoped>
.docs {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px;
  line-height: 1.7;
  color: var(--text-primary);
}

.title {
  font-size: 40px;
  font-weight: 800;
  margin: 25px 0px 0px 45px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 60px;
  margin-bottom: 20px;
}

.main-container {
  width: 100%;
  margin: 0 10px;
}


a {
  color: var(--accent-color);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}


/* 发帖按钮 */
.post-actions {
  margin: 16px 0;
}

.post-btn {
  padding: 12px 20px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.post-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

/* 发帖表单 */
.post-form {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
}

.post-form h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.submit-btn {
  padding: 10px 20px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  padding: 10px 20px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}

/* 统计信息 */
.stats {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: end;
}

.stat {
  color: var(--text-tertiary);
  font-size: 16px;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

/* 仿资讯流的纵向列表布局 */
.grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--border-color);
}

.card {
  background: transparent;
  border-bottom: 1px solid var(--border-color);
  padding: 16px 8px;
  transition: background .15s ease;
  position: relative;
}

.pin-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  background: #f59e0b;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 0 0 0 8px;
  letter-spacing: 0.02em;
  pointer-events: none;
}

.card:hover {
  background: var(--bg-secondary);
  cursor: pointer;
}

.meta {
  padding: 0 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row.top {
  justify-content: space-between;
}

.row.bottom {
  justify-content: space-between;
  align-items: end;
  margin-top: 8px;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  font-weight: 600;
}

.badge.tech {
  background: var(--accent-color);
}

.badge.experience {
  background: #f59e0b;
}

.badge.project {
  background: #10b981;
}

.badge.help {
  background: #ef4444;
}

.c-title {
  font-size: 22px;
  font-weight: 700;
  margin: 2px 0 6px 0;
  line-height: 1.5;
}

.c-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.author {
  color: var(--text-tertiary);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.time {
  color: var(--text-tertiary);
  font-size: 12px;
}

@media (max-width: 1024px) {
  .grid {
    border-top: 1px solid var(--border-color);
  }
}
</style>
