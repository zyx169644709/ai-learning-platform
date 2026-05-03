import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/layouts/AdminLayout.vue'

// 懒加载页面组件
const Dashboard = () => import('@/pages/admin/Dashboard.vue')
const Analytics = () => import('@/pages/admin/Analytics.vue')
const CourseManagement = () => import('@/pages/admin/CourseManagement.vue')
const UserManagement = () => import('@/pages/admin/UserManagement.vue')
const ChapterManagement = () => import('@/pages/admin/ChapterManagement.vue')
const ResourceManagement = () => import('@/pages/admin/ResourceManagement.vue')
const QuizManagement = () => import('@/pages/admin/QuizManagement.vue')
const DiscussionManagement = () => import('@/pages/admin/DiscussionManagement.vue')
const CommentManagement = () => import('@/pages/admin/CommentManagement.vue')
const Login = () => import('@/pages/auth/Login.vue')
const NotFound = () => import('@/pages/admin/NotFound.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics
      },
      {
        path: 'courses',
        name: 'CourseManagement',
        component: CourseManagement
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: UserManagement,
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'chapters',
        name: 'ChapterManagement',
        component: ChapterManagement
      },
      {
        path: 'resources',
        name: 'ResourceManagement',
        component: ResourceManagement
      },
      {
        path: 'quizzes',
        name: 'QuizManagement',
        component: QuizManagement
      },
      {
        path: 'community/discussions',
        name: 'DiscussionManagement',
        component: DiscussionManagement
      },
      {
        path: 'community/comments',
        name: 'CommentManagement',
        component: CommentManagement
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to: any, _from: any, next: any) => {
  const userStore = useUserStore()
  
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    // 检查是否已登录
    if (!userStore.token) {
      ElMessage.error('请先登录')
      next('/login')
      return
    }
    
    // 验证 token 有效性
    if (!userStore.userInfo) {
      try {
        await userStore.getUserInfo()
      } catch (error) {
        ElMessage.error('登录已过期，请重新登录')
        userStore.logout()
        next('/login')
        return
      }
    }
    
    // 检查后台权限
    if (!userStore.isStaff) {
      ElMessage.error('您没有权限访问管理后台')
      next('/login')
      return
    }

    const routeRoles = to.meta.roles as string[] | undefined
    if (routeRoles?.length && !userStore.hasAnyRole(...routeRoles)) {
      ElMessage.error('您没有权限访问该页面')
      next('/admin')
      return
    }
  }
  
  // 如果已登录，访问登录页则跳转到首页
  if (to.path === '/login' && userStore.token) {
    next('/admin')
    return
  }
  
  next()
})

export default router
