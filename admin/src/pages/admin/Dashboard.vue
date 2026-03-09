<template>
  <div class="dashboard-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1>仪表盘</h1>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>仪表盘</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" circle @click="refreshData" :loading="loading" />
      </div>
    </div>

    <!-- 实时概览区 -->
    <div class="overview-cards">
      <el-card class="overview-card" shadow="hover">
        <div class="card-content">
          <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <el-icon :size="24"><UserFilled /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">+{{ todayStats.newUsers }}</div>
            <div class="card-label">今日新增用户</div>
            <div class="card-trend" :class="{ positive: todayStats.userGrowth >= 0 }">
              <el-icon><CaretTop v-if="todayStats.userGrowth >= 0" /><CaretBottom v-else /></el-icon>
              <span>{{ Math.abs(todayStats.userGrowth) }}%</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="overview-card" shadow="hover">
        <div class="card-content">
          <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <el-icon :size="24"><DocumentAdd /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">+{{ todayStats.newContent }}</div>
            <div class="card-label">今日新增内容</div>
            <div class="card-trend" :class="{ positive: todayStats.contentGrowth >= 0 }">
              <el-icon><CaretTop v-if="todayStats.contentGrowth >= 0" /><CaretBottom v-else /></el-icon>
              <span>{{ Math.abs(todayStats.contentGrowth) }}%</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="overview-card" shadow="hover" @click="handlePendingClick">
        <div class="card-content">
          <div class="card-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
            <el-icon :size="24"><Warning /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ todayStats.pendingReview }}</div>
            <div class="card-label">待审核内容</div>
            <div class="card-status" :class="{ urgent: todayStats.pendingReview > 5 }">
              {{ todayStats.pendingReview > 5 ? '需处理' : '正常' }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="overview-card" shadow="hover">
        <div class="card-content">
          <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <el-icon :size="24"><TrendCharts /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ todayStats.userActivity }}%</div>
            <div class="card-label">用户活跃度</div>
            <div class="card-status" :class="{ healthy: todayStats.userActivity >= 30 }">
              {{ todayStats.activityLabel }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧：待办事项 -->
      <div class="left-section">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>📋 待办事项</span>
              <el-badge :value="totalTodos" :max="99" class="todo-badge" />
            </div>
          </template>
          <div class="todo-list">
            <div 
              v-for="todo in todos" 
              :key="todo.type"
              class="todo-item"
              :class="{ urgent: todo.count > 5 }"
              @click="handleTodoClick(todo.type)"
            >
              <div class="todo-icon" :style="{ background: todo.color }">
                <el-icon><component :is="todo.icon" /></el-icon>
              </div>
              <div class="todo-info">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-desc">{{ todo.description }}</div>
              </div>
              <el-badge :value="todo.count" :max="99" class="todo-count" />
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间：实时活动流 -->
      <div class="middle-section">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>🔄 实时活动</span>
              <el-button 
                size="small" 
                :icon="Refresh" 
                :loading="loading"
                @click="loadDashboardData"
              >
                刷新
              </el-button>
            </div>
          </template>
          <el-timeline class="activity-timeline">
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.timestamp"
              :type="activity.type"
              :icon="activity.icon"
            >
              <div class="activity-content">
                <span class="activity-text">{{ activity.content }}</span>
                <el-tag v-if="activity.tag" size="small" :type="activity.tagType">{{ activity.tag }}</el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
          <div v-if="recentActivities.length === 0" class="empty-state">
            <el-empty description="暂无活动" :image-size="80" />
          </div>
        </el-card>
      </div>

      <!-- 右侧：快速操作 + 内容质量 -->
      <div class="right-section">
        <!-- 快速操作 -->
        <el-card class="quick-actions-card">
          <template #header>
            <span>⚡ 快速操作</span>
          </template>
          <div class="action-grid">
            <el-button 
              type="primary" 
              :icon="Plus" 
              @click="$router.push('/admin/courses')"
            >
              创建课程
            </el-button>
            <el-button 
              type="success" 
              :icon="FolderAdd" 
              @click="$router.push('/admin/resources')"
            >
              添加资源
            </el-button>
            <el-button 
              type="info" 
              :icon="User" 
              @click="$router.push('/admin/users')"
            >
              用户管理
            </el-button>
            <el-button 
              type="warning" 
              :icon="DataAnalysis" 
              @click="$router.push('/admin/analytics')"
            >
              查看分析
            </el-button>
          </div>
        </el-card>

        <!-- 内容质量监控 -->
        <el-card class="quality-card">
          <template #header>
            <span>📈 内容质量指标</span>
          </template>
          <div class="quality-metrics">
            <div class="metric-item">
              <div class="metric-label">平均课程完成率</div>
              <el-progress 
                :percentage="qualityMetrics.courseCompletion" 
                :color="getProgressColor(qualityMetrics.courseCompletion)"
              />
            </div>
            <div class="metric-item">
              <div class="metric-label">用户活跃度</div>
              <el-progress 
                :percentage="qualityMetrics.userActivity" 
                :color="getProgressColor(qualityMetrics.userActivity)"
                :format="() => qualityMetrics.userActivityLabel"
              />
            </div>
            <div class="metric-item">
              <div class="metric-label">讨论互动率</div>
              <el-progress 
                :percentage="qualityMetrics.discussionEngagement" 
                :color="getProgressColor(qualityMetrics.discussionEngagement)"
              />
            </div>
            <div class="metric-item">
              <div class="metric-label">资源利用率</div>
              <el-progress 
                :percentage="qualityMetrics.resourceUtilization" 
                :color="getProgressColor(qualityMetrics.resourceUtilization)"
              />
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-section">
      <!-- 用户角色分布 -->
      <el-card class="role-card">
        <template #header>
          <span>👥 用户角色分布</span>
        </template>
        <div class="role-list">
          <div class="role-item">
            <div class="role-icon admin">
              <el-icon><Avatar /></el-icon>
            </div>
            <div class="role-info">
              <div class="role-name">管理员</div>
              <div class="role-count">{{ userRoles.admin }} 人</div>
            </div>
          </div>
          <div class="role-item">
            <div class="role-icon moderator">
              <el-icon><User /></el-icon>
            </div>
            <div class="role-info">
              <div class="role-name">版主</div>
              <div class="role-count">{{ userRoles.moderator }} 人</div>
            </div>
          </div>
          <div class="role-item">
            <div class="role-icon user">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="role-info">
              <div class="role-name">普通用户</div>
              <div class="role-count">{{ userRoles.user.toLocaleString() }} 人</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 本周趋势 -->
      <el-card class="trend-card">
        <template #header>
          <span>📊 本周趋势</span>
        </template>
        <div class="trend-list">
          <div class="trend-item">
            <div class="trend-label">新增用户</div>
            <div class="trend-bars">
              <div 
                v-for="(value, index) in weeklyTrend.usersData" 
                :key="index"
                class="trend-bar users-bar"
                :style="{ 
                  height: weeklyTrend.usersData.length > 0 && Math.max(...weeklyTrend.usersData) > 0
                    ? `${(value / Math.max(...weeklyTrend.usersData)) * 100}%` 
                    : '2px' 
                }"
                :title="`${value} 人`"
              />
            </div>
            <div class="trend-value">{{ weeklyTrend.usersTotal }}</div>
          </div>
          <div class="trend-item">
            <div class="trend-label">新增内容</div>
            <div class="trend-bars">
              <div 
                v-for="(value, index) in weeklyTrend.contentData" 
                :key="index"
                class="trend-bar content-bar"
                :style="{ 
                  height: weeklyTrend.contentData.length > 0 && Math.max(...weeklyTrend.contentData) > 0
                    ? `${(value / Math.max(...weeklyTrend.contentData)) * 100}%` 
                    : '2px' 
                }"
                :title="`${value} 个`"
              />
            </div>
            <div class="trend-value">{{ weeklyTrend.contentTotal }}</div>
          </div>
          <div class="trend-item">
            <div class="trend-label">活跃度</div>
            <div class="trend-bars">
              <div 
                v-for="(value, index) in weeklyTrend.activityData" 
                :key="index"
                class="trend-bar activity-bar"
                :style="{ 
                  height: weeklyTrend.activityData.length > 0 && Math.max(...weeklyTrend.activityData) > 0
                    ? `${(value / Math.max(...weeklyTrend.activityData)) * 100}%` 
                    : '2px' 
                }"
                :title="`${value}%`"
              />
            </div>
            <div class="trend-value">{{ weeklyTrend.activityAvg }}%</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { 
  User,
  UserFilled,
  Avatar,
  Plus,
  FolderAdd,
  DataAnalysis,
  Refresh,
  DocumentAdd,
  Warning,
  TrendCharts,
  CaretTop,
  CaretBottom,
  ChatDotRound,
  Document,
  Reading,
  Files
} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

// 今日统计数据
const todayStats = ref({
  newUsers: 0,
  userGrowth: 0,
  newContent: 0,
  contentGrowth: 0,
  pendingReview: 0,
  userActivity: 0,
  activityLabel: '较低'
})

// 待办事项
const todos = ref([
  {
    type: 'pendingDiscussions',
    title: '待审核讨论帖',
    description: '需要审核的社区讨论',
    count: 0,
    color: '#f56c6c',
    icon: markRaw(ChatDotRound),
    route: '/admin/community/discussions'
  },
  {
    type: 'pendingComments',
    title: '待审核评论',
    description: '需要审核的用户评论',
    count: 0,
    color: '#e6a23c',
    icon: markRaw(Document),
    route: '/admin/community/comments'
  },
  {
    type: 'newUsers',
    title: '新用户注册',
    description: '今日新注册用户',
    count: 0,
    color: '#67c23a',
    icon: markRaw(UserFilled),
    route: '/admin/users'
  },
  {
    type: 'draftCourses',
    title: '待发布课程',
    description: '草稿状态的课程',
    count: 0,
    color: '#409eff',
    icon: markRaw(Reading),
    route: '/admin/courses'
  },
  {
    type: 'draftResources',
    title: '待发布资源',
    description: '草稿状态的资源',
    count: 0,
    color: '#909399',
    icon: markRaw(Files),
    route: '/admin/resources'
  }
])

const totalTodos = computed(() => {
  return todos.value.reduce((sum, todo) => sum + todo.count, 0)
})

// 实时活动流
const recentActivities = ref<any[]>([])

// 内容质量指标
const qualityMetrics = ref({
  courseCompletion: 0,
  userActivity: 0,
  userActivityLabel: '良好',
  discussionEngagement: 0,
  resourceUtilization: 0
})

// 用户角色分布
const userRoles = ref({
  admin: 0,
  moderator: 0,
  user: 0
})

// 本周趋势
const weeklyTrend = ref({
  usersData: [] as number[],      // 最近7天每日新增用户数
  usersTotal: 0,
  contentData: [] as number[],    // 最近7天每日新增内容数
  contentTotal: 0,
  activityData: [] as number[],   // 最近7天每日活跃度
  activityAvg: 0
})

// 加载仪表盘数据
const loadDashboardData = async () => {
  loading.value = true
  try {
    // 获取今日统计
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const [usersRes, coursesRes, resourcesRes, discussionsRes, chaptersRes, commentsRes] = await Promise.all([
      request.get('/admin/users?page=1&limit=1000'),
      request.get('/admin/courses?page=1&limit=1000'),
      request.get('/admin/resources?page=1&limit=1000'),
      request.get('/admin/community/discussions?page=1&limit=1000'),
      request.get('/admin/chapters?page=1&limit=1000&type=chapter'),
      request.get('/admin/community/comments?page=1&limit=1000')
    ])

    const allUsers = usersRes.data?.data?.items || []
    const allCourses = coursesRes.data?.data?.items || []
    const allResources = resourcesRes.data?.data?.items || []
    const allDiscussions = discussionsRes.data?.data?.items || []
    const allChapters = chaptersRes.data?.data?.items || []
    const allComments = commentsRes.data?.data?.items || []

    // 计算今日新增（兼容registeredAt和createdAt字段）
    const todayUsers = allUsers.filter((u: any) => {
      const dateStr = u.registeredAt || u.createdAt
      if (!dateStr) return false
      // 处理格式化的日期字符串 "2026-03-05 09:12" 或 ISO 格式
      const userDate = new Date(dateStr.replace(' ', 'T'))
      return userDate >= todayStart
    })
    
    const todayContent = [
      ...allCourses.filter((c: any) => {
        const dateStr = c.updatedAt || c.createdAt
        if (!dateStr) return false
        const courseDate = new Date(dateStr.replace(' ', 'T'))
        return courseDate >= todayStart
      }),
      ...allResources.filter((r: any) => {
        const dateStr = r.updatedAt || r.createdAt
        if (!dateStr) return false
        const resourceDate = new Date(dateStr.replace(' ', 'T'))
        return resourceDate >= todayStart
      }),
      ...allChapters.filter((ch: any) => {
        const dateStr = ch.updatedAt || ch.createdAt
        if (!dateStr) return false
        const chapterDate = new Date(dateStr.replace(' ', 'T'))
        return chapterDate >= todayStart
      })
    ]

    // 计算昨日数据用于增长率
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayUsers = allUsers.filter((u: any) => {
      const dateStr = u.registeredAt || u.createdAt
      if (!dateStr) return false
      const userDate = new Date(dateStr.replace(' ', 'T'))
      return userDate >= yesterdayStart && userDate < todayStart
    })
    
    // 计算昨日新增内容
    const yesterdayContent = [
      ...allCourses.filter((c: any) => {
        const dateStr = c.updatedAt || c.createdAt
        if (!dateStr) return false
        const courseDate = new Date(dateStr.replace(' ', 'T'))
        return courseDate >= yesterdayStart && courseDate < todayStart
      }),
      ...allResources.filter((r: any) => {
        const dateStr = r.updatedAt || r.createdAt
        if (!dateStr) return false
        const resourceDate = new Date(dateStr.replace(' ', 'T'))
        return resourceDate >= yesterdayStart && resourceDate < todayStart
      }),
      ...allChapters.filter((ch: any) => {
        const dateStr = ch.updatedAt || ch.createdAt
        if (!dateStr) return false
        const chapterDate = new Date(dateStr.replace(' ', 'T'))
        return chapterDate >= yesterdayStart && chapterDate < todayStart
      })
    ]
    
    // 计算今日登录用户数（基于lastLogin字段）
    const todayActiveUsers = allUsers.filter((u: any) => {
      const lastLogin = u.lastLogin
      if (!lastLogin || lastLogin === '-') return false
      // 处理格式化的日期字符串 "2026-03-05 09:12"
      const loginDate = new Date(lastLogin.replace(' ', 'T'))
      return loginDate >= todayStart
    })

    // 用户活跃度 = 今日登录用户数 / 总用户数 × 100%
    const activityRate = allUsers.length > 0 ? Math.round((todayActiveUsers.length / allUsers.length) * 100) : 0
    
    // 活跃度评级标准
    let activityLabel = '较低'
    if (activityRate >= 50) {
      activityLabel = '优秀'
    } else if (activityRate >= 30) {
      activityLabel = '良好'
    } else if (activityRate >= 10) {
      activityLabel = '一般'
    }

    todayStats.value = {
      newUsers: todayUsers.length,
      userGrowth: yesterdayUsers.length > 0 
        ? Math.round(((todayUsers.length - yesterdayUsers.length) / yesterdayUsers.length) * 100)
        : (todayUsers.length > 0 ? 100 : 0),
      newContent: todayContent.length,
      contentGrowth: yesterdayContent.length > 0
        ? Math.round(((todayContent.length - yesterdayContent.length) / yesterdayContent.length) * 100)
        : (todayContent.length > 0 ? 100 : 0),
      pendingReview: allDiscussions.filter((d: any) => d.status === 'pending').length +
                     allComments.filter((c: any) => c.status === 'pending').length,
      userActivity: activityRate,
      activityLabel: activityLabel
    }

    // 更新待办事项
    todos.value[0].count = allDiscussions.filter((d: any) => d.status === 'pending').length
    todos.value[1].count = allComments.filter((c: any) => c.status === 'pending').length
    todos.value[2].count = todayUsers.length
    todos.value[3].count = allCourses.filter((c: any) => c.status === 'draft').length
    todos.value[4].count = allResources.filter((r: any) => r.status === 'draft').length

    // 生成实时活动流
    const activities: any[] = []
    
    // 所有用户注册活动
    allUsers.forEach((user: any) => {
      activities.push({
        id: `user-${user.id}`,
        content: `用户 "${user.name || user.username}" 注册了账号`,
        timestamp: formatTime(user.registeredAt || user.createdAt),
        type: 'success',
        icon: markRaw(UserFilled),
        tag: '新用户',
        tagType: 'success'
      })
    })

    // 所有讨论发布活动
    allDiscussions.forEach((discussion: any) => {
      activities.push({
        id: `discussion-${discussion.id}`,
        content: `发布了新讨论 "${discussion.title}"`,
        timestamp: formatTime(discussion.createdAt),
        type: 'primary',
        icon: markRaw(ChatDotRound),
        tag: '讨论',
        tagType: 'primary'
      })
    })

    // 所有已发布课程活动
    allCourses.forEach((course: any) => {
      if (course.status === 'published') {
        activities.push({
          id: `course-${course.id}`,
          content: `发布了新课程 "${course.title}"`,
          timestamp: formatTime(course.updatedAt),
          type: 'warning',
          icon: markRaw(Reading),
          tag: '课程',
          tagType: 'warning'
        })
      }
    })

    // 按时间排序
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    recentActivities.value = activities.slice(0, 10)

    // 计算质量指标
    const totalCourses = allCourses.length
    const totalUsers = allUsers.length
    const totalDiscussions = allDiscussions.length
    const totalResources = allResources.length

    qualityMetrics.value = {
      courseCompletion: totalCourses > 0 ? Math.min(Math.round((totalCourses / (totalCourses + 10)) * 100), 100) : 0,
      userActivity: activityRate,
      userActivityLabel: activityLabel,
      discussionEngagement: totalDiscussions > 0 ? Math.min(Math.round((allComments.length / totalDiscussions) * 10), 100) : 0,
      resourceUtilization: totalResources > 0 ? Math.min(Math.round((totalResources / (totalResources + 5)) * 100), 100) : 0
    }

    // 用户角色分布
    userRoles.value = {
      admin: allUsers.filter((u: any) => u.role === 'ADMIN').length,
      moderator: allUsers.filter((u: any) => u.role === 'MODERATOR').length,
      user: allUsers.filter((u: any) => u.role === 'USER').length
    }

    // 本周趋势 - 计算最近7天的每日数据
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      date.setHours(0, 0, 0, 0)
      return date
    })
    
    // 计算每天的新增用户数
    const dailyUsersData = last7Days.map(day => {
      const nextDay = new Date(day)
      nextDay.setDate(nextDay.getDate() + 1)
      return allUsers.filter((u: any) => {
        const dateStr = u.registeredAt || u.createdAt
        if (!dateStr) return false
        const userDate = new Date(dateStr.replace(' ', 'T'))
        return userDate >= day && userDate < nextDay
      }).length
    })
    
    // 计算每天的新增内容数
    const dailyContentData = last7Days.map(day => {
      const nextDay = new Date(day)
      nextDay.setDate(nextDay.getDate() + 1)
      const dayContent = [
        ...allCourses.filter((c: any) => {
          const dateStr = c.updatedAt || c.createdAt
          if (!dateStr) return false
          const courseDate = new Date(dateStr.replace(' ', 'T'))
          return courseDate >= day && courseDate < nextDay
        }),
        ...allResources.filter((r: any) => {
          const dateStr = r.updatedAt || r.createdAt
          if (!dateStr) return false
          const resourceDate = new Date(dateStr.replace(' ', 'T'))
          return resourceDate >= day && resourceDate < nextDay
        }),
        ...allChapters.filter((ch: any) => {
          const dateStr = ch.updatedAt || ch.createdAt
          if (!dateStr) return false
          const chapterDate = new Date(dateStr.replace(' ', 'T'))
          return chapterDate >= day && chapterDate < nextDay
        })
      ]
      return dayContent.length
    })
    
    // 计算每天的活跃度
    const dailyActivityData = last7Days.map(day => {
      const nextDay = new Date(day)
      nextDay.setDate(nextDay.getDate() + 1)
      const dayActiveUsers = allUsers.filter((u: any) => {
        const lastLogin = u.lastLogin
        if (!lastLogin || lastLogin === '-') return false
        const loginDate = new Date(lastLogin.replace(' ', 'T'))
        return loginDate >= day && loginDate < nextDay
      }).length
      return totalUsers > 0 ? Math.round((dayActiveUsers / totalUsers) * 100) : 0
    })

    weeklyTrend.value = {
      usersData: dailyUsersData,
      usersTotal: dailyUsersData.reduce((a, b) => a + b, 0),
      contentData: dailyContentData,
      contentTotal: dailyContentData.reduce((a, b) => a + b, 0),
      activityData: dailyActivityData,
      activityAvg: dailyActivityData.length > 0 
        ? Math.round(dailyActivityData.reduce((a, b) => a + b, 0) / dailyActivityData.length) 
        : 0
    }

  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    ElMessage.error('加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  loadDashboardData()
  ElMessage.success('数据已刷新')
}

// 处理待审核点击
const handlePendingClick = () => {
  if (todayStats.value.pendingReview > 0) {
    router.push('/admin/community/discussions')
  }
}

// 处理待办事项点击
const handleTodoClick = (type: string) => {
  const todo = todos.value.find(t => t.type === type)
  if (todo && todo.route) {
    router.push(todo.route)
  }
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 自动刷新定时器
let refreshTimer: NodeJS.Timeout | null = null

onMounted(() => {
  loadDashboardData()
  // 每5分钟自动刷新一次
  refreshTimer = setInterval(() => {
    loadDashboardData()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 实时概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.overview-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 12px;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.overview-card .card-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.overview-card .card-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.overview-card .card-info {
  flex: 1;
}

.overview-card .card-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.overview-card .card-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.overview-card .card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #f56c6c;
  font-weight: 600;
}

.overview-card .card-trend.positive {
  color: #67c23a;
}

.overview-card .card-status {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.overview-card .card-status.urgent {
  color: #f56c6c;
}

.overview-card .card-status.healthy {
  color: #67c23a;
}

/* 主要内容区 */
.main-content {
  display: grid;
  grid-template-columns: 350px 1fr 350px;
  gap: 20px;
  margin-bottom: 24px;
}

/* 左侧：待办事项 */
.left-section {
  display: flex;
  flex-direction: column;
}

.todo-card {
  height: 100%;
}

.todo-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.todo-item:hover {
  background: #e8f4ff;
  border-left-color: #409eff;
  transform: translateX(4px);
}

.todo-item.urgent {
  background: #fef0f0;
  border-left-color: #f56c6c;
}

.todo-item.urgent:hover {
  background: #fde2e2;
}

.todo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.todo-info {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.todo-desc {
  font-size: 12px;
  color: #909399;
}

.todo-count {
  flex-shrink: 0;
}

/* 中间：实时活动流 */
.middle-section {
  display: flex;
  flex-direction: column;
}

.activity-card {
  height: 100%;
}

.activity-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-timeline {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.activity-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.activity-text {
  font-size: 14px;
  color: #606266;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 右侧：快速操作 + 内容质量 */
.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-actions-card .action-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.quick-actions-card .el-button {
  width: 100%;
  height: 56px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-sizing: border-box;
}

.quick-actions-card .el-button > span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.quick-actions-card .el-button .el-icon {
  margin: 0;
}

.quick-actions-card .el-button + .el-button {
  margin-left: 0;
}

.quality-card .quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

/* 底部区域 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 用户角色分布 */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.role-item:hover {
  background: #e8f4ff;
  transform: translateX(4px);
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.role-icon.admin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.role-icon.moderator {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.role-icon.user {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.role-count {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
}

/* 本周趋势 */
.trend-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.trend-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 40px;
  padding: 4px 0;
}

.trend-bar {
  flex: 1;
  border-radius: 3px;
  min-height: 2px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.trend-bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.users-bar {
  background: linear-gradient(to top, #667eea 0%, #764ba2 100%);
}

.content-bar {
  background: linear-gradient(to top, #f093fb 0%, #f5576c 100%);
}

.activity-bar {
  background: linear-gradient(to top, #4facfe 0%, #00f2fe 100%);
}

.trend-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

/* 响应式布局 */
@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 1fr 1fr;
  }
  
  .right-section {
    grid-column: span 2;
  }
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .right-section {
    grid-column: auto;
  }
  
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions-card .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>
