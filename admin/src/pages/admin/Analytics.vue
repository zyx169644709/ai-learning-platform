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
    <div class="stats-cards-container">
      <!-- 左侧按钮 -->
      <el-button 
        :icon="ArrowLeft" 
        circle 
        class="nav-btn nav-left"
        @click="prevCards"
      />
      
      <!-- 卡片网格 -->
      <transition-group name="card-slide" tag="div" class="stats-cards">
        <div 
          v-for="card in visibleCards" 
          :key="card.title"
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
      </transition-group>
      
      <!-- 右侧按钮 -->
      <el-button 
        :icon="ArrowRight" 
        circle 
        class="nav-btn nav-right"
        @click="nextCards"
      />
    </div>

    <!-- 图表区域第一行 -->
    <div class="charts-row">
      <!-- 数据增长趋势 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>数据增长趋势</span>
            <div style="display: flex; gap: 12px;">
              <el-select 
                v-model="trendPeriod" 
                class="trend-select" 
                @change="handleTrendPeriodChange"
              >
                <el-option label="本周" value="week" />
                <el-option label="近一个月" value="month" />
                <el-option label="近六个月" value="halfYear" />
              </el-select>
              <el-select 
                v-model="trendChartType" 
                class="trend-select"
              >
                <el-option label="新增用户" value="新增用户" />
                <el-option label="新增课程" value="新增课程" />
                <el-option label="新增讨论" value="新增讨论" />
                <el-option label="新增章节" value="新增章节" />
                <el-option label="新增评论" value="新增评论" />
              </el-select>
            </div>
          </div>
        </template>
        <v-chart :option="trendChartOption" :autoresize="true" style="height: 300px;" />
      </el-card>

      <!-- 内容分布情况 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>内容分布情况</span>
            <el-select 
              v-model="pieChartType" 
              class="trend-select"
            >
              <el-option label="数量统计" value="数量统计" />
              <el-option label="浏览量" value="浏览量" />
              <el-option label="收藏量" value="收藏量" />
            </el-select>
          </div>
        </template>
        <v-chart :option="pieChartOption" :autoresize="true" style="height: 300px;" />
      </el-card>
    </div>

    <!-- 排行榜区域 -->
    <el-card class="rank-card">
      <template #header>
        <div class="card-header">
          <span>🔥 热门排行榜</span>
          <div class="rank-controls">
            <el-select
              v-model="rankContentType"
              class="rank-select"
              placeholder="选择内容类型"
            >
              <el-option label="课程" value="课程" />
              <el-option label="小节" value="小节" />
              <el-option label="资源" value="资源" />
              <el-option label="帖子" value="帖子" />
            </el-select>
            <el-select
              v-model="rankMetric"
              class="rank-select"
              placeholder="选择统计维度"
            >
              <el-option label="浏览量" value="浏览量" />
              <el-option label="收藏量" value="收藏量" />
            </el-select>
          </div>
        </div>
      </template>
      
      <div class="rank-list">
        <div 
          v-for="(item, index) in currentRankList" 
          :key="index"
          class="rank-item"
          style="cursor: pointer"
          @click="viewDetail(item)"
        >
          <div class="rank-badge" :class="`rank-${index + 1}`">
            <span v-if="index < 3" class="medal">{{ ['🥇', '🥈', '🥉'][index] }}</span>
            <span v-else class="rank-num">{{ index + 1 }}</span>
          </div>
          
          <div class="rank-content">
            <div class="rank-title">{{ item.title }}</div>
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  Document, 
  Files, 
  ChatDotRound, 
  Refresh,
  TrendCharts,
  ArrowLeft,
  ArrowRight
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
const trendPeriod = ref('week') // 趋势图表时间周期
const trendChartType = ref('新增用户')
const pieChartType = ref('数量统计')

// 卡片循环轮播
const currentStartIndex = ref(0)
const cardsPerPage = 4

const visibleCards = computed(() => {
  const result = []
  for (let i = 0; i < cardsPerPage; i++) {
    const index = (currentStartIndex.value + i) % statsCards.value.length
    result.push(statsCards.value[index])
  }
  return result
})

const nextCards = () => {
  currentStartIndex.value = (currentStartIndex.value + 1) % statsCards.value.length
}

const prevCards = () => {
  currentStartIndex.value = (currentStartIndex.value - 1 + statsCards.value.length) % statsCards.value.length
}

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
  },
  {
    title: '总章节（含小节）',
    value: 0,
    trend: '+0%',
    icon: markRaw(Document),
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    subtext: '本周新增 0'
  },
  {
    title: '总评论',
    value: 0,
    trend: '+0%',
    icon: markRaw(ChatDotRound),
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    subtext: '本周新增 0'
  }
])

// 趋势数据存储
const trendData = ref<{ [key: string]: number[] }>({
  '新增用户': [],
  '新增课程': [],
  '新增讨论': [],
  '新增章节': [],
  '新增评论': []
})

const trendDates = ref<string[]>([])

// 趋势图表配置
const trendChartOption = computed(() => {
  const currentData = trendData.value[trendChartType.value] || []
  const maxValue = Math.max(...currentData, 0)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: trendDates.value
    },
    yAxis: {
      type: 'value',
      minInterval: 1, // 最小刻度间隔为1，避免出现小数
      splitNumber: maxValue <= 5 ? maxValue : undefined // 如果最大值<=5，按实际值分割
    },
    series: [{
      data: currentData,
      type: 'line',
      smooth: true,
      itemStyle: {
        color: '#667eea'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
          ]
        }
      }
    }]
  }
})

// 饼图数据存储
const pieChartData = ref<{ [key: string]: Array<{ name: string; value: number }> }>({
  '数量统计': [
    { name: '课程', value: 0 },
    { name: '资源', value: 0 },
    { name: '讨论', value: 0 },
    { name: '章节（含小节）', value: 0 }
  ],
  '浏览量': [
    { name: '课程', value: 0 },
    { name: '资源', value: 0 },
    { name: '讨论', value: 0 },
    { name: '章节（含小节）', value: 0 }
  ],
  '收藏量': [
    { name: '课程', value: 0 },
    { name: '资源', value: 0 },
    { name: '讨论', value: 0 },
    { name: '章节（含小节）', value: 0 }
  ]
})

// 饼图配置
const pieChartOption = computed(() => {
  
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
      data: pieChartData.value[pieChartType.value],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666']
    }]
  }
})

// 排行榜选择器
const rankContentType = ref('课程')
const rankMetric = ref('浏览量')

// 排行榜项类型
interface RankItem {
  title: string
  category: string
  author: string
  value: number
  percentage: number
}

// 排行榜数据存储
const rankData = ref<{
  [key: string]: {
    [key: string]: RankItem[]
  }
}>({
  '课程': {
    '浏览量': [],
    '收藏量': []
  },
  '小节': {
    '浏览量': [],
    '收藏量': []
  },
  '资源': {
    '浏览量': [],
    '收藏量': []
  },
  '帖子': {
    '浏览量': [],
    '收藏量': []
  }
})

// 当前排行榜数据
const currentRankList = computed(() => {
  return rankData.value[rankContentType.value]?.[rankMetric.value] || []
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
    const [analyticsRes, coursesRes, resourcesRes, discussionsRes, chaptersRes, sectionsRes, commentsRes] = await Promise.all([
      request.get('/admin/analytics'),
      request.get('/admin/courses?page=1&limit=1000'),
      request.get('/admin/resources?page=1&limit=1000'),
      request.get('/admin/community/discussions?page=1&limit=1000'),
      request.get('/admin/chapters?page=1&limit=1000&type=chapter'),
      request.get('/admin/chapters?page=1&limit=1000&type=section'),
      request.get('/admin/community/comments?page=1&limit=1000')
    ])
    
    // 获取所有数据
    const analyticsData = analyticsRes.data?.data || {}
    const allCourses = coursesRes.data?.data?.items || []
    const allResources = resourcesRes.data?.data?.items || []
    const allDiscussions = discussionsRes.data?.data?.items || []
    const allChapters = chaptersRes.data?.data?.items || []
    const allSections = sectionsRes.data?.data?.items || []
    const allComments = commentsRes.data?.data?.items || []
    
    // 根据时间周期筛选数据（使用正确的日期字段）
    const filteredCourses = filterByTimeRange(allCourses, 'updatedAt')
    const filteredResources = filterByTimeRange(allResources, 'updatedAt')
    const filteredDiscussions = filterByTimeRange(allDiscussions, 'createdAt')
    const filteredChapters = filterByTimeRange(allChapters, 'updatedAt')
    const filteredComments = filterByTimeRange(allComments, 'createdAt')
    
    // 更新统计卡片
    const periodText = timePeriod.value === '今日' ? '今日' : timePeriod.value === '本周' ? '本周' : '本月'
    
    // 计算增长率的辅助函数
    const calculateGrowthRate = (newCount: number, total: number): string => {
      if (total === 0) return '0%'
      const rate = (newCount / total * 100).toFixed(1)
      return newCount > 0 ? `+${rate}%` : '0%'
    }
    
    const totalUsers = analyticsData.totalUsers || 0
    const newUsersCount = timePeriod.value === '今日'
      ? Number(analyticsData.newUsers?.today || 0)
      : timePeriod.value === '本周'
        ? Number(analyticsData.newUsers?.week || 0)
        : Number(analyticsData.newUsers?.month || 0)
    statsCards.value[0].value = totalUsers
    statsCards.value[0].subtext = `${periodText}新增 ${newUsersCount}`
    statsCards.value[0].trend = calculateGrowthRate(newUsersCount, totalUsers)
    
    const totalCourses = coursesRes.data?.data?.total || 0
    statsCards.value[1].value = totalCourses
    statsCards.value[1].subtext = `${periodText}新增 ${filteredCourses.length}`
    statsCards.value[1].trend = calculateGrowthRate(filteredCourses.length, totalCourses)
    
    const totalResources = resourcesRes.data?.data?.total || 0
    statsCards.value[2].value = totalResources
    statsCards.value[2].subtext = `${periodText}新增 ${filteredResources.length}`
    statsCards.value[2].trend = calculateGrowthRate(filteredResources.length, totalResources)
    
    const totalDiscussions = discussionsRes.data?.data?.total || 0
    statsCards.value[3].value = totalDiscussions
    statsCards.value[3].subtext = `${periodText}新增 ${filteredDiscussions.length}`
    statsCards.value[3].trend = calculateGrowthRate(filteredDiscussions.length, totalDiscussions)
    
    // 章节（含小节）统计
    const filteredSections = filterByTimeRange(allSections, 'updatedAt')
    const totalChaptersAndSections = allChapters.length + allSections.length
    const newChaptersAndSections = filteredChapters.length + filteredSections.length
    statsCards.value[4].value = totalChaptersAndSections
    statsCards.value[4].subtext = `${periodText}新增 ${newChaptersAndSections}`
    statsCards.value[4].trend = calculateGrowthRate(newChaptersAndSections, totalChaptersAndSections)
    
    const totalComments = commentsRes.data?.data?.total || 0
    statsCards.value[5].value = totalComments
    statsCards.value[5].subtext = `${periodText}新增 ${filteredComments.length}`
    statsCards.value[5].trend = calculateGrowthRate(filteredComments.length, totalComments)
    
    // 生成饼图数据
    generatePieChartData(allCourses, allResources, allChapters, allSections, allDiscussions)
    
    // 生成排行榜数据（使用所有数据，不过滤时间）
    generateRankData(allCourses, allResources, allSections, allDiscussions)
    
    // 生成趋势数据
    generateTrendData(analyticsData.trends?.[trendPeriod.value]?.users || [], allCourses, allDiscussions, allChapters, allComments)
    
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 生成趋势数据
const generateTrendData = (userTrendCounts: number[], courses: any[], discussions: any[], chapters: any[], comments: any[]) => {
  const dates: string[] = []
  const courseCounts: number[] = []
  const discussionCounts: number[] = []
  const chapterCounts: number[] = []
  const commentCounts: number[] = []
  const now = new Date()
  
  if (trendPeriod.value === 'week') {
    // 本周：最近7天
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
      
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(startDate)
      endDate.setHours(23, 59, 59, 999)
      
      courseCounts.push(courses.filter(c => {
        const d = new Date(c.updatedAt || c.createdAt)
        return d >= startDate && d <= endDate
      }).length)
      
      discussionCounts.push(discussions.filter(d => {
        const date = new Date(d.createdAt)
        return date >= startDate && date <= endDate
      }).length)
      
      chapterCounts.push(chapters.filter(c => {
        const d = new Date(c.updatedAt || c.createdAt)
        return d >= startDate && d <= endDate
      }).length)
      
      commentCounts.push(comments.filter(c => {
        const d = new Date(c.createdAt)
        return d >= startDate && d <= endDate
      }).length)
    }
  } else if (trendPeriod.value === 'month') {
    // 近一个月：最近30天，每7天一个数据点（总共5个点）
    for (let i = 4; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000)
      
      // 显示日期范围（开始日期换行结束日期）
      const startStr = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`
      const endStr = `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
      dates.push(`${startStr}\n-${endStr}`)
      
      weekStart.setHours(0, 0, 0, 0)
      weekEnd.setHours(23, 59, 59, 999)
      
      courseCounts.push(courses.filter(c => {
        const d = new Date(c.updatedAt || c.createdAt)
        return d >= weekStart && d <= weekEnd
      }).length)
      
      discussionCounts.push(discussions.filter(d => {
        const date = new Date(d.createdAt)
        return date >= weekStart && date <= weekEnd
      }).length)
      
      chapterCounts.push(chapters.filter(c => {
        const d = new Date(c.updatedAt || c.createdAt)
        return d >= weekStart && d <= weekEnd
      }).length)
      
      commentCounts.push(comments.filter(c => {
        const d = new Date(c.createdAt)
        return d >= weekStart && d <= weekEnd
      }).length)
    }
  } else {
    // 近六个月：最近6个月
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      dates.push(`${monthDate.getMonth() + 1}月`)
      
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999)
      
      courseCounts.push(courses.filter(c => {
        const d = new Date(c.updatedAt || c.createdAt)
        return d >= monthStart && d <= monthEnd
      }).length)
      
      discussionCounts.push(discussions.filter(d => {
        const date = new Date(d.createdAt)
        return date >= monthStart && date <= monthEnd
      }).length)
      
      chapterCounts.push(chapters.filter(c => {
        const d = new Date(c.updatedAt || c.createdAt)
        return d >= monthStart && d <= monthEnd
      }).length)
      
      commentCounts.push(comments.filter(c => {
        const d = new Date(c.createdAt)
        return d >= monthStart && d <= monthEnd
      }).length)
    }
  }
  
  trendDates.value = dates
  trendData.value = {
    '新增用户': userTrendCounts,
    '新增课程': courseCounts,
    '新增讨论': discussionCounts,
    '新增章节': chapterCounts,
    '新增评论': commentCounts
  }
}

// 趋势周期变化
const handleTrendPeriodChange = () => {
  loadAllData()
}

// 生成饼图数据
const generatePieChartData = (courses: any[], resources: any[], chapters: any[], sections: any[], discussions: any[]) => {
  // 数量统计（章节含小节）
  pieChartData.value['数量统计'] = [
    { name: '课程', value: courses.length },
    { name: '资源', value: resources.length },
    { name: '讨论', value: discussions.length },
    { name: '章节（含小节）', value: chapters.length + sections.length }
  ]
  
  // 浏览量统计（章节使用小节浏览量，讨论使用views字段）
  const courseViews = courses.reduce((sum, c) => sum + (c.viewCount || 0), 0)
  const resourceViews = resources.reduce((sum, r) => sum + (r.viewCount || 0), 0)
  const sectionViews = sections.reduce((sum, s) => sum + (s.viewCount || 0), 0)
  const discussionViews = discussions.reduce((sum, d) => sum + (d.views || 0), 0)
  
  pieChartData.value['浏览量'] = [
    { name: '课程', value: courseViews },
    { name: '资源', value: resourceViews },
    { name: '讨论', value: discussionViews },
    { name: '章节（含小节）', value: sectionViews }
  ]
  
  // 收藏量统计（章节使用小节收藏量）
  const courseFavorites = courses.reduce((sum, c) => sum + (c.favoriteCount || 0), 0)
  const resourceFavorites = resources.reduce((sum, r) => sum + (r.favoriteCount || 0), 0)
  const sectionFavorites = sections.reduce((sum, s) => sum + (s.favoriteCount || 0), 0)
  const discussionFavorites = discussions.reduce((sum, d) => sum + (d.favoriteCount || 0), 0)
  
  pieChartData.value['收藏量'] = [
    { name: '课程', value: courseFavorites },
    { name: '资源', value: resourceFavorites },
    { name: '讨论', value: discussionFavorites },
    { name: '章节（含小节）', value: sectionFavorites }
  ]
}

// 生成排行榜数据
const generateRankData = (courses: any[], resources: any[], sections: any[], discussions: any[]) => {
  // 课程浏览量排行
  if (courses && courses.length > 0) {
    const courseViewRanks = courses
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
    
    const maxValue = courseViewRanks[0]?.value || 1
    courseViewRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    rankData.value['课程']['浏览量'] = courseViewRanks
    
    // 课程收藏量排行
    const courseFavRanks = courses
      .map((c: any) => ({
        title: c.title,
        category: c.type === 'beginner' ? '基础' : c.type === 'intermediate' ? '进阶' : c.type === 'advanced' ? '高级' : '基础',
        author: '管理员',
        value: c.favoriteCount || 0,
        percentage: 0
      }))
      .filter((c: any) => c.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxFavValue = courseFavRanks[0]?.value || 1
    courseFavRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxFavValue) * 100)
    })
    rankData.value['课程']['收藏量'] = courseFavRanks
  }
  
  // 小节浏览量和收藏量排行
  if (sections && sections.length > 0) {
    const sectionViewRanks = sections
      .map((s: any) => ({
        title: s.title,
        category: '小节',
        author: '管理员',
        value: s.viewCount || 0,
        percentage: 0
      }))
      .filter((s: any) => s.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxValue = sectionViewRanks[0]?.value || 1
    sectionViewRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    rankData.value['小节']['浏览量'] = sectionViewRanks
    
    const sectionFavRanks = sections
      .map((s: any) => ({
        title: s.title,
        category: '小节',
        author: '管理员',
        value: s.favoriteCount || 0,
        percentage: 0
      }))
      .filter((s: any) => s.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxFavValue = sectionFavRanks[0]?.value || 1
    sectionFavRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxFavValue) * 100)
    })
    rankData.value['小节']['收藏量'] = sectionFavRanks
  }
  
  // 资源浏览量和收藏量排行
  if (resources && resources.length > 0) {
    const resourceViewRanks = resources
      .map((r: any) => ({
        title: r.title,
        category: r.type === 'website' ? '网站' : r.type === 'document' ? '文档' : r.type === 'tool' ? '工具' : r.type === 'tutorial' ? '教程' : '其他',
        author: '管理员',
        value: r.viewCount || 0,
        percentage: 0
      }))
      .filter((r: any) => r.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxValue = resourceViewRanks[0]?.value || 1
    resourceViewRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    rankData.value['资源']['浏览量'] = resourceViewRanks
    
    const resourceFavRanks = resources
      .map((r: any) => ({
        title: r.title,
        category: r.type === 'website' ? '网站' : r.type === 'document' ? '文档' : r.type === 'tool' ? '工具' : r.type === 'tutorial' ? '教程' : '其他',
        author: '管理员',
        value: r.favoriteCount || 0,
        percentage: 0
      }))
      .filter((r: any) => r.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxFavValue = resourceFavRanks[0]?.value || 1
    resourceFavRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxFavValue) * 100)
    })
    rankData.value['资源']['收藏量'] = resourceFavRanks
  }
  
  // 帖子浏览量和收藏量排行
  if (discussions && discussions.length > 0) {
    const discussionViewRanks = discussions
      .map((d: any) => ({
        title: d.title,
        category: d.category === 'TECH' ? '技术' : d.category === 'EXPERIENCE' ? '经验' : d.category === 'PROJECT' ? '项目' : d.category === 'HELP' ? '求助' : '其他',
        author: d.author || '用户',
        value: d.views || 0,
        percentage: 0
      }))
      .filter((d: any) => d.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxValue = discussionViewRanks[0]?.value || 1
    discussionViewRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxValue) * 100)
    })
    rankData.value['帖子']['浏览量'] = discussionViewRanks
    
    const discussionFavRanks = discussions
      .map((d: any) => ({
        title: d.title,
        category: d.category === 'TECH' ? '技术' : d.category === 'EXPERIENCE' ? '经验' : d.category === 'PROJECT' ? '项目' : d.category === 'HELP' ? '求助' : '其他',
        author: d.author || '用户',
        value: d.favoriteCount || 0,
        percentage: 0
      }))
      .filter((d: any) => d.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)
    
    const maxFavValue = discussionFavRanks[0]?.value || 1
    discussionFavRanks.forEach((item: any) => {
      item.percentage = Math.floor((item.value / maxFavValue) * 100)
    })
    rankData.value['帖子']['收藏量'] = discussionFavRanks
  }
}

// 时间周期变化
const handlePeriodChange = () => {
  ElMessage.success(`已切换到${timePeriod.value}数据`)
  loadAllData()
}

// 刷新数据
const refreshData = () => {
  loadAllData()
}

// 导出报表
const exportReport = async () => {
  try {
    // 动态导入 xlsx 库
    const XLSX = await import('xlsx')
    
    // 根据时间周期生成列名
    const periodColumnName = timePeriod.value === '今日' ? '今日新增' 
                           : timePeriod.value === '本周' ? '近一周新增' 
                           : '近一月新增'
    
    // 准备统计数据（使用动态列名）
    const statsData = statsCards.value.map(card => {
      const newCount = card.subtext.replace(/.*新增 /, '')
      return {
        '指标': card.title,
        '总数': card.value,
        [periodColumnName]: newCount,
        '增长率': card.trend
      }
    })
    
    // 准备排行榜数据
    const currentRank = currentRankList.value
    const metricColumnName = rankMetric.value // "浏览量" 或 "收藏量"
    const rankExportData = currentRank.map((item: any, index: number) => ({
      '排名': index + 1,
      '名称': item.title,
      '分类': item.category,
      [metricColumnName]: item.value
    }))
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    
    // 添加统计数据工作表
    const ws1 = XLSX.utils.json_to_sheet(statsData)
    ws1['!cols'] = [
      { width: 16 },  // 指标
      { width: 12 },  // 总数
      { width: 18 },  // 新增（动态列名）
      { width: 12 }   // 增长率
    ]
    XLSX.utils.book_append_sheet(wb, ws1, '统计数据')
    
    // 添加排行榜工作表
    const ws2 = XLSX.utils.json_to_sheet(rankExportData)
    ws2['!cols'] = [
      { width: 8 },   // 排名
      { width: 30 },  // 名称
      { width: 12 },  // 分类
      { width: 12 }   // 数值
    ]
    XLSX.utils.book_append_sheet(wb, ws2, `${rankContentType.value}${rankMetric.value}排行`)
    
    // 生成文件名
    const periodText = timePeriod.value === '今日' ? 'daily' 
                     : timePeriod.value === '本周' ? 'weekly' 
                     : 'monthly'
    const dateStr = new Date().toISOString().split('T')[0]
    const fileName = `数据分析报表_${periodText}_${dateStr}.xlsx`
    
    // 导出文件
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success('报表导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('报表导出失败，请确保已安装 xlsx 依赖')
  }
}

// 查看详情
const router = useRouter()

const viewDetail = (item: RankItem) => {
  const routeMap: Record<string, string> = {
    '课程': '/admin/courses',
    '小节': '/admin/chapters',
    '资源': '/admin/resources',
    '帖子': '/admin/community/discussions'
  }
  const target = routeMap[rankContentType.value]
  if (target) {
    router.push({ path: target, query: { search: item.title } })
  }
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

/* 统计卡片容器 */
.stats-cards-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.stats-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  position: relative;
}

.nav-btn {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.nav-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 卡片滑动动画 */
.card-slide-move {
  transition: all 0.5s ease;
}

.card-slide-enter-active {
  transition: all 0.5s ease;
}

.card-slide-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  z-index: 0;
}

.card-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.card-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 1400px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    width: 100%;
  }
  
  .nav-btn {
    display: none;
  }
  
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

/* 趋势图表选择框样式 */
.trend-select {
  width: 140px;
}

.trend-select :deep(.el-input__wrapper) {
  font-size: 14px;
  padding: 6px 12px;
  min-height: 36px;
}

.trend-select :deep(.el-input__inner) {
  font-size: 14px;
  font-weight: 500;
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

.rank-select {
  width: 140px;
}

.rank-select :deep(.el-input__wrapper) {
  font-size: 14px;
  padding: 6px 12px;
  min-height: 36px;
}

.rank-select :deep(.el-input__inner) {
  font-size: 14px;
  font-weight: 500;
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
  
  .rank-select {
    width: 100%;
  }
}
</style>
