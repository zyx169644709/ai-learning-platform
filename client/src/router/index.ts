import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'
import Home from '../pages/Home.vue'
import Courses from '../pages/Courses.vue'
import ChapterContent from '../pages/ChapterContent.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import ChangePassword from '../pages/ChangePassword.vue'
import EditProfile from '../pages/EditProfile.vue'
import Resources from '../pages/Resources.vue'
import ResourceDetail from '../pages/ResourceDetail.vue'
import Community from '../pages/Community.vue'
import DiscussionDetail from '../pages/DiscussionDetail.vue'
import Tarot from '../pages/agent/Tarot.vue'
import MBTI from '../pages/agent/MBTI.vue'
import CodeEditor from '../pages/CodeEditor.vue'
import TeachingAssistant from '../pages/api/DeepSeek.vue'
import Kimi from '../pages/api/Kimi.vue'
import SearchResults from '../pages/SearchResults.vue'

const routes: RouteRecordRaw[] = [
  { path: '/home', name: 'Home', component: Home },
  { path: '/courses', name: 'Courses', component: Courses },
  { path: '/chapter/:chapterSlug/:sectionSlug?/:subSlug?', name: 'ChapterContent', component: ChapterContent },
  { path: '/resources', name: 'Resources', component: Resources },
  { path: '/resource/:id', name: 'ResourceDetail', component: ResourceDetail },
  { path: '/community', name: 'Community', component: Community },
  { path: '/discussion/:id', name: 'DiscussionDetail', component: DiscussionDetail, meta: { hideLeftSidebar: true, hideRightSidebar: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/',
     name: 'Welcome', 
     component: () => import('../pages/Welcome.vue'),
      meta: { topOnly: true, hideLeftSidebar: true, hideRightSidebar: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: EditProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true }
  },
  {
    path: '/agent/tarot',
    name: 'Tarot',
    component: Tarot,
    meta: { hideLeftSidebar: true, hideRightSidebar: false }
  },
  {
    path: '/agent/mbti',
    name: 'MBTI',
    component: MBTI,
    meta: { hideLeftSidebar: true, hideRightSidebar: false }
  },
  {
    path: '/api/deepseek',
    name: 'TeachingAssistant',
    component: () => import('../pages/api/DeepSeek.vue'),
    meta: { hideLeftSidebar: true, hideRightSidebar: false }
  },
  {
    path: '/api/kimi',
    name: 'Kimi',
    component: Kimi,
    meta: { hideLeftSidebar: true, hideRightSidebar: false }
  },
  {
    path: '/code-editor',
    name: 'CodeEditor',
    component: CodeEditor,
    meta: { topOnly: true, hideLeftSidebar: true, hideRightSidebar: true }
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: SearchResults
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果浏览器有内置的前进/后退位置，优先使用
    if (savedPosition) {
      return savedPosition
    }

    // 进入全屏编辑器时，强制将主容器滚动到顶部
    if (to.name === 'CodeEditor' || to.path === '/code-editor') {
      requestAnimationFrame(() => {
        const container = document.querySelector('.main-content') as HTMLElement | null
        if (container) {
          container.scrollTo({ left: 0, top: 0, behavior: 'auto' })
        } else {
          window.scrollTo({ left: 0, top: 0, behavior: 'auto' })
        }
      })
      return false as any
    }

    // 如果我们存了自定义的滚动位置，并且目标路由与记录匹配，则恢复
    try {
      const raw = sessionStorage.getItem('restoreScroll')
      if (raw) {
        const state = JSON.parse(raw)
        if (state && typeof state.left === 'number' && typeof state.top === 'number' && state.path === to.fullPath) {
          // 等待下一帧再滚动，确保 DOM 渲染完成
          requestAnimationFrame(() => {
            const container = document.querySelector('.main-content') as HTMLElement | null
            if (container) {
              container.scrollTo({ left: state.left, top: state.top, behavior: 'auto' })
            } else {
              window.scrollTo({ left: state.left, top: state.top, behavior: 'auto' })
            }
          })
          // 恢复后清理，避免影响后续导航
          sessionStorage.removeItem('restoreScroll')
          // 这里返回 false，表示我们手动处理滚动
          return false as any
        }
      }
    } catch { }

    // 默认滚动到顶部（兼容自定义滚动容器与 window）
    requestAnimationFrame(() => {
      const main = document.querySelector('.main-content') as HTMLElement | null
      const chapter = document.querySelector('.chapter-content') as HTMLElement | null
      if (main) main.scrollTo({ left: 0, top: 0, behavior: 'auto' })
      if (chapter) chapter.scrollTo({ left: 0, top: 0, behavior: 'auto' })
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' })
    })
    return false as any
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    // 确保用户状态已加载
    if (!userStore.userInfo) {
      await userStore.loadUser()
    }

    if (!userStore.isLogin) {
      next('/login')
      return
    }
  }

  next()
})

export default router



