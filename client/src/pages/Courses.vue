<template>
  <div class="docs">
    <h1 class="title">课程</h1>
    <div class="main-container">
      <div class="callout">
        <span class="play">▶</span>
        <RouterLink to="/api/deepseek">不知道学什么？让智能助教给你推荐</RouterLink>
      </div>

      

      <div class="grid">
        <div class="card" v-for="c in filteredCourses" :key="c.id" @click="goToBilibiliVideo(c)">
          <div class="thumb">
            <img :src="c.cover" :alt="c.title" />
            
            <!-- 添加播放按钮图标 -->
            <div class="play-overlay" v-if="c.bilibiliUrl">
              <div class="play-icon">▶</div>
            </div>
          </div>
          <div class="meta">
            <div class="c-title">{{ c.title }}</div>
            <div class="c-desc">{{ c.desc }}</div>
            <div class="row">
              <span class="author"><img class="avatar" :src="c.authorAvatar" alt="" /> {{ c.author }}</span>
              <span class="tag" v-if="c.free">免费</span>
              <span class="video-tag" v-if="c.bilibiliUrl">📺 视频课程</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const query = ref('')

type Level = string
interface CourseCard { 
  id: string; 
  title: string; 
  desc: string; 
  level: Level; 
  cover: string; 
  author: string; 
  authorAvatar: string; 
  free?: boolean;
  bilibiliUrl?: string;  // B站视频链接
  url?: string;          // 其他外链
  videoPlatform?: 'bilibili' | 'youtube' | 'local';  // 视频平台
  videoId?: string;  // 视频ID（用于嵌入）
}

const courses = ref<CourseCard[]>([])

type ApiCourse = { id: string; title: string; description?: string; level?: string; cover?: string; url?: string; tags?: any }

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/courses')
    const data: ApiCourse[] = await res.json()
    courses.value = (data || []).map((c) => ({
      id: c.id,
      title: c.title,
      desc: c.description || '',
      level: (c.level as Level) || '',
      cover: c.cover || '/src/assets/images/course-beginner-cover.svg',
      author: '课程组',
      authorAvatar: '/src/assets/images/default.png',
      bilibiliUrl: c.url?.includes('bilibili') ? c.url : undefined,
      url: c.url,
      videoPlatform: c.url?.includes('bilibili') ? 'bilibili' : undefined,
      videoId: undefined,
      free: undefined
    }))
  } catch (e) {
    console.error('加载课程失败', e)
  }
})

const filteredCourses = computed(() => {
  let result = courses.value

  // 难度筛选已移除

  // 按搜索关键词筛选
  const q = query.value.trim().toLowerCase()
  if (q) {
    result = result.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.desc.toLowerCase().includes(q) ||
      c.author.toLowerCase().includes(q)
    )
  }

  return result
})

const onSearch = () => {
  // 已通过计算属性实时过滤，这里保留以便未来接入后端
}

// 添加跳转到B站视频的函数
const goToBilibiliVideo = (course: CourseCard) => {
  if (course.bilibiliUrl || course.url) {
    // 在新标签页打开B站视频
    window.open(course.bilibiliUrl || course.url, '_blank')
  } else {
    alert('课程视频正在制作中，敬请期待！')
  }
}

 
</script>

<style scoped>
/* 与 Home.vue 保持一致的基础排版 */
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
  padding: 28px;
}

.callout {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 24px;
}

.play {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-color);
  color: #fff;
  font-weight: 700;
}

a {
  color: var(--accent-color);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* 难度筛选按钮样式 */
.level-filters {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.level-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.level-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
}

.level-btn.active {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}

/* 课程网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.thumb {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

 

.meta {
  padding: 12px;
}

.c-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.c-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
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

.tag {
  background: var(--accent-color);
  color: #fff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
}

.video-tag {
  background: #ff6b6b;
  color: #fff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
}

/* 播放按钮覆盖层 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
}
</style>