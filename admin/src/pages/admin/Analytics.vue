<template>
  <div class="analytics-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1>数据分析</h1>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>数据分析</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-segmented v-model="timePeriod" :options="['今日', '本周', '本月']" @change="handlePeriodChange" />
        <el-button type="primary" @click="exportReport">导出报表</el-button>
        <el-button :icon="Refresh" circle @click="refreshData" :loading="loading" />
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <div 
        v-for="(card, index) in statsCards" 
        :key="index"
        class="stat-card"
        :style="{ background: card.color }"
      >
        <div class="card-icon">
          <el-icon :size="32"><component :is="card.icon" /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ card.value }}</div>
          <div class="card-title">{{ card.title }}</div>
          <div class="card-subtext">{{ card.subtext }}</div>
          <div class="card-trend" :class="{ positive: card.trend.startsWith('+') }">
            <el-icon><TrendCharts /></el-icon>
            <span>{{ card.trend }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域第一行 -->
    <div class="charts-row">
      <!-- 数据增长趋势 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>数据增长趋势</span>
            <el-segmented 
              v-model="trendChartType" 
              :options="['新增用户', '新增课程', '新增讨论']"
              size="small"
            />
          </div>
        </template>
        <v-chart :option="trendChartOption" :autoresize="true" style="height: 300px;" />
      </el-card>

      <!-- 内容分布情况 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>内容分布情况</span>
            <el-segmented 
              v-model="pieChartType" 
              :options="['数量统计', '浏览量', '收藏量']"
              size="small"
            />
          </div>
        </template>
        <v-chart :option="pieChartOption" :autoresize="true" style="height: 300px;" />
      </el-card>
    </div>

    <!-- 图表区域第二行 -->
    <div class="charts-row">
      <!-- 用户活跃度 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>用户活跃度分析</span>
          </div>
        </template>
        <v-chart :option="activeChartOption" :autoresize="true" style="height: 300px;" />
      </el-card>

      <!-- 学习进度分布 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>用户学习进度分布</span>
          </div>
        </template>
        <v-chart :option="progressChartOption" :autoresize="true" style="height: 300px;" />
      </el-card>
    </div>

    <!-- 排行榜区域 -->
    <el-card class="rank-card">
      <template #header>
        <div class="card-header">
          <span>🔥 热门排行榜</span>
          <div class="rank-controls">
            <el-segmented 
              v-model="rankType" 
              :options="['课程浏览榜', '资源下载榜', '用户学习榜', '讨论热度榜', '章节收藏榜']"
              size="small"
            />
            <el-segmented 
              v-model="rankPeriod" 
              :options="['日榜', '周榜', '月榜']"
              size="small"
            />
          </div>
        </div>
      </template>
      
      <div class="rank-list">
        <div 
          v-for="(item, index) in currentRankList" 
          :key="index"
          class="rank-item"
          @click="viewDetail(item)"
        >
          <div class="rank-badge" :class="`rank-${index + 1}`">
            <span v-if="index < 3" class="medal">{{ ['🥇', '🥈', '🥉'][index] }}</span>
            <span v-else class="rank-num">{{ index + 1 }}</span>
          </div>
          
          <div class="rank-content">
            <div class="rank-title">{{ item.title }}</div>
            <div class="rank-meta">
              <el-tag size="small" type="info">{{ item.category }}</el-tag>
              <span class="author">{{ item.author }}</span>
            </div>
          </div>
          
          <div class="rank-stats">
            <div class="stat-value">{{ formatNumber(item.value) }}</div>
            <el-progress 
              :percentage="item.percentage" 
              :color="getRankColor(index)"
              :stroke-width="8"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, 
  Document, 
  Files, 
  ChatDotRound, 
  Refresh,
  TrendCharts
} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { 
  LineChart, 
  BarChart, 
  PieChart 
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import request from '@/utils/request'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const loading = ref(false)
const timePeriod = ref('本周')
const trendChartType = ref('新增用户')
const pieChartType = ref('数量统计')
const rankType = ref('课程浏览榜')
const rankPeriod = ref('周榜')

// 统计卡片数据
const statsCards = ref([
  {
    title: '总用户',
    value: 0,
    trend: '+0%',
    icon: markRaw(User),
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    subtext: '本周新增 0'
  },
  {
    title: '总课程',
    value: 0,
    trend: '+0%',
    icon: markRaw(Document),
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    subtext: '本月新增 0'
  },
  {
    title: '总资源',
    value: 0,
    trend: '+0%',
    icon: markRaw(Files),
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    subtext: '本周新增 0'
  },
  {
    title: '总讨论',
    value: 0,
    trend: '+0%',
    icon: markRaw(ChatDotRound),
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    subtext: '本周新增 0'
  }
])

// 趋势图表配置
const trendChartOption = computed(() => {
  const dataMap: { [key: string]: number[] } = {
    '新增用户': [12, 15, 10, 18, 22, 16, 20],
    '新增课程': [1, 0, 2, 1, 0, 1, 1],
    '新增讨论': [5, 8, 6, 9, 12, 7, 10]
  }
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: dataMap[trendChartType.value],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(102, 126, 234, 0.5)'
          }, {
            offset: 1, color: 'rgba(102, 126, 234, 0.1)'
          }]
        }
      },
      lineStyle: {
        color: '#667eea',
        width: 3
      },
      itemStyle: {
        color: '#667eea'
      }
    }]
  }
})

// 饼图配置
const pieChartOption = computed(() => {
  const dataMap: { [key: string]: Array<{ name: string; value: number }> } = {
    '数量统计': [
      { name: '课程', value: 56 },
      { name: '资源', value: 234 },
      { name: '章节', value: 189 },
      { name: '讨论', value: 567 }
    ],
    '浏览量': [
      { name: '课程', value: 12340 },
      { name: '资源', value: 8900 },
      { name: '章节', value: 15600 },
      { name: '讨论', value: 23450 }
    ],
    '收藏量': [
      { name: '课程', value: 456 },
      { name: '资源', value: 789 },
      { name: '章节', value: 612 },
      { name: '讨论', value: 890 }
    ]
  }
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: dataMap[pieChartType.value],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666']
    }]
  }
})

// 活跃度柱状图配置
const activeChartOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['活跃用户', '学习用户']
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '活跃用户',
      type: 'bar',
      data: [45, 52, 48, 60, 68, 55, 50],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: '#83bff6'
          }, {
            offset: 1, color: '#188df0'
          }]
        }
      }
    },
    {
      name: '学习用户',
      type: 'bar',
      data: [30, 38, 35, 45, 50, 40, 38],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: '#91cc75'
          }, {
            offset: 1, color: '#5daf34'
          }]
        }
      }
    }
  ]
})

// 学习进度环形图配置
const progressChartOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} 人 ({d}%)'
  },
  legend: {
    bottom: '5%',
    left: 'center'
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: false
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    data: [
      { name: '0-20%', value: 156 },
      { name: '21-40%', value: 234 },
      { name: '41-60%', value: 345 },
      { name: '61-80%', value: 278 },
      { name: '81-100%', value: 221 }
    ],
    color: ['#ee6666', '#fac858', '#91cc75', '#73c0de', '#5470c6']
  }]
})

// 排行榜项类型
interface RankItem {
  title: string
  category: string
  author: string
  value: number
  percentage: number
}

// 排行榜数据
const rankLists = ref<{
  [key: string]: {
    [key: string]: RankItem[]
  }
}>({
  '课程浏览榜': {
    '日榜': [],
    '周榜': [],
    '月榜': []
  },
  '资源下载榜': {
    '日榜': [],
    '周榜': [],
    '月榜': []
  },
  '用户学习榜': {
    '日榜': [],
    '周榜': [],
    '月榜': []
  },
  '讨论热度榜': {
    '日榜': [],
    '周榜': [],
    '月榜': []
  },
  '章节收藏榜': {
    '日榜': [],
    '周榜': [],
    '月榜': []
  }
})

// 当前排行榜数据
const currentRankList = computed(() => {
  return rankLists.value[rankType.value]?.[rankPeriod.value] || []
})

// 获取排行榜颜色
const getRankColor = (index: number) => {
  const colors = [
    '#f56c6c', // 金
    '#e6a23c', // 银
    '#409eff', // 铜
    '#67c23a',
    '#909399'
  ]
  return colors[Math.min(index, colors.length - 1)]
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 计算时间范围
const getTimeRange = () => {
  const now = new Date()
  let startDate: Date
  
  switch (timePeriod.value) {
    case '今日':
      // 今天 00:00 到现在
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case '本周':
      // 最近7天
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '本月':
      // 最近30天
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  
  return { startDate, endDate: now }
}

// 过滤时间范围内的数据
const filterByTimeRange = (items: any[], dateField: string = 'createdAt') => {
  const { startDate } = getTimeRange()
  return items.filter(item => {
    const itemDate = new Date(item[dateField])
    return itemDate >= startDate
  })
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    const [usersRes, coursesRes, resourcesRes, discussionsRes] = await Promise.all([
      request.get('/admin/users?page=1&limit=1000'),
      request.get('/admin/courses?page=1&limit=1000'),
      request.get('/admin/resources?page=1&limit=1000'),
      request.get('/admin/community/discussions?page=1&limit=1000')
    ])
    
    // 获取所有数据
    const allUsers = usersRes.data?.data?.items || []
    const allCourses = coursesRes.data?.data?.items || []
    const allResources = resourcesRes.data?.data?.items || []
    const allDiscussions = discussionsRes.data?.data?.items || []
    
    // 根据时间周期筛选数据（使用正确的日期字段）
    const filteredUsers = filterByTimeRange(allUsers, 'registeredAt')
    const filteredCourses = filterByTimeRange(allCourses, 'updatedAt')
    const filteredResources = filterByTimeRange(allResources, 'updatedAt')
    const filteredDiscussions = filterByTimeRange(allDiscussions, 'createdAt')
    
    // 更新统计卡片
    const periodText = timePeriod.value === '今日' ? '今日' : timePeriod.value === '本周' ? '本周' : '本月'
    
    statsCards.value[0].value = usersRes.data?.data?.total || 0
    statsCards.value[0].subtext = `${periodText}新增 ${filteredUsers.length}`
    statsCards.value[0].trend = filteredUsers.length > 0 ? `+${filteredUsers.length}` : '0'
    
    statsCards.value[1].value = coursesRes.data?.data?.total || 0
    statsCards.value[1].subtext = `${periodText}新增 ${filteredCourses.length}`
    statsCards.value[1].trend = filteredCourses.length > 0 ? `+${filteredCourses.length}` : '0'
    
    statsCards.value[2].value = resourcesRes.data?.data?.total || 0
    statsCards.value[2].subtext = `${periodText}新增 ${filteredResources.length}`
    statsCards.value[2].trend = filteredResources.length > 0 ? `+${filteredResources.length}` : '0'
    
    statsCards.value[3].value = discussionsRes.data?.data?.total || 0
    statsCards.value[3].subtext = `${periodText}新增 ${filteredDiscussions.length}`
    statsCards.value[3].trend = filteredDiscussions.length > 0 ? `+${filteredDiscussions.length}` : '0'
    
    // 生成排行榜数据（使用所有数据，不过滤时间）
    generateRankData(allCourses, allResources, allUsers, allDiscussions)
    
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 生成排行榜数据
const generateRankData = (courses: any[], resources: any[], users: any[], discussions: any[]) => {
  // 课程浏览榜
  if (courses && courses.length > 0) {
    const courseRanks = courses
      .map((c: any) => ({
        title: c.title,
        category: c.type === 'beginner' ? '基础' : c.type === 'intermediate' ? '进阶' : c.type === 'advanced' ? '高级' : '基础',
        author: '管理员',
        value: c.viewCount || 0,
        percentage: 0
      }))
      .filter((c: any) => c.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxValue = courseRanks[0]?.value || 1
    courseRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    
    rankLists.value['课程浏览榜']['周榜'] = courseRanks
    rankLists.value['课程浏览榜']['日榜'] = courseRanks
    rankLists.value['课程浏览榜']['月榜'] = courseRanks
  }
  
  // 资源下载榜
  if (resources && resources.length > 0) {
    const resourceRanks = resources
      .map((r: any) => ({
        title: r.title,
        category: r.type === 'website' ? '网站' : r.type === 'document' ? '文档' : r.type === 'tool' ? '工具' : r.type === 'tutorial' ? '教程' : '其他',
        author: '管理员',
        value: r.viewCount || r.likeCount || 0,
        percentage: 0
      }))
      .filter((r: any) => r.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxValue = resourceRanks[0]?.value || 1
    resourceRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    
    rankLists.value['资源下载榜']['周榜'] = resourceRanks
    rankLists.value['资源下载榜']['日榜'] = resourceRanks
    rankLists.value['资源下载榜']['月榜'] = resourceRanks
  }
  
  // 用户学习榜
  if (users && users.length > 0) {
    const userRanks = users
      .map((u: any) => ({
        title: u.name,
        category: '用户',
        author: u.role === 'ADMIN' ? '管理员' : u.role === 'MODERATOR' ? '教师' : '学生',
        value: u.completedCourses || u.favoritesCount || 0,
        percentage: 0
      }))
      .filter((u: any) => u.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxValue = userRanks[0]?.value || 1
    userRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    
    rankLists.value['用户学习榜']['周榜'] = userRanks
    rankLists.value['用户学习榜']['日榜'] = userRanks
    rankLists.value['用户学习榜']['月榜'] = userRanks
  }
  
  // 讨论热度榜
  if (discussions && discussions.length > 0) {
    const discussionRanks = discussions
      .map((d: any) => ({
        title: d.title,
        category: d.category === 'TECH' ? '技术' : d.category === 'EXPERIENCE' ? '经验' : d.category === 'PROJECT' ? '项目' : d.category === 'HELP' ? '求助' : '其他',
        author: d.author || '用户',
        value: d.views || d.likes || 0,
        percentage: 0
      }))
      .filter((d: any) => d.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxValue = discussionRanks[0]?.value || 1
    discussionRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    
    rankLists.value['讨论热度榜']['周榜'] = discussionRanks
    rankLists.value['讨论热度榜']['日榜'] = discussionRanks
    rankLists.value['讨论热度榜']['月榜'] = discussionRanks
  }
  
  // 章节收藏榜（模拟数据）
  rankLists.value['章节收藏榜']['周榜'] = [
    { title: 'Vue 3 组合式 API', category: '基础课程', author: '管理员', value: 1234, percentage: 100 },
    { title: 'React Hooks 详解', category: '进阶课程', author: '管理员', value: 987, percentage: 80 },
    { title: 'TypeScript 类型系统', category: '高级课程', author: '管理员', value: 856, percentage: 69 },
    { title: 'Pinia 状态管理', category: '进阶课程', author: '管理员', value: 745, percentage: 60 },
    { title: 'Vue Router 路由', category: '基础课程', author: '管理员', value: 632, percentage: 51 },
    { title: 'Vite 构建工具', category: '进阶课程', author: '管理员', value: 521, percentage: 42 },
    { title: 'Element Plus 组件', category: '基础课程', author: '管理员', value: 456, percentage: 37 },
    { title: 'ECharts 数据可视化', category: '进阶课程', author: '管理员', value: 398, percentage: 32 },
    { title: 'Axios 网络请求', category: '基础课程', author: '管理员', value: 312, percentage: 25 },
    { title: 'CSS 响应式布局', category: '基础课程', author: '管理员', value: 267, percentage: 22 }
  ]
  rankLists.value['章节收藏榜']['日榜'] = rankLists.value['章节收藏榜']['周榜']
  rankLists.value['章节收藏榜']['月榜'] = rankLists.value['章节收藏榜']['周榜']
  
  // 如果没有数据，提供默认提示
  Object.keys(rankLists.value).forEach(rankType => {
    Object.keys(rankLists.value[rankType]).forEach(period => {
      if (rankLists.value[rankType][period].length === 0) {
        rankLists.value[rankType][period] = [{
          title: '暂无数据',
          category: '-',
          author: '-',
          value: 0,
          percentage: 0
        }]
      }
    })
  })
}

// 时间周期变化
const handlePeriodChange = () => {
  ElMessage.info(`已切换到${timePeriod.value}数据`)
  loadAllData()
}

// 刷新数据
const refreshData = () => {
  loadAllData()
}

// 导出报表
const exportReport = () => {
  ElMessage.success('报表导出功能开发中...')
}

// 查看详情
const viewDetail = (item: any) => {
  ElMessage.info(`查看详情: ${item.title}`)
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.analytics-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.card-subtext {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.card-trend.positive {
  color: rgba(255, 255, 255, 0.95);
}

/* 图表区域 */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 排行榜 */
.rank-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rank-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.rank-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.rank-list {
  display: grid;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.rank-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rank-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #f56c6c, #ff8a8a);
  color: white;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #e6a23c, #f0b65f);
  color: white;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
}

.rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: #e8e8e8;
  color: #606266;
}

.medal {
  font-size: 24px;
}

.rank-num {
  font-size: 20px;
}

.rank-content {
  flex: 1;
  min-width: 0;
}

.rank-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.author {
  color: #909399;
}

.rank-stats {
  min-width: 120px;
  text-align: right;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rank-controls {
    width: 100%;
  }
  
  .rank-controls .el-segmented {
    width: 100%;
  }
}
</style>
