<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h2 class="logo" v-show="!sidebarCollapsed">管理后台</h2>
        <el-icon class="collapse-btn" @click="toggleSidebar">
          <Expand v-if="sidebarCollapsed" />
          <Fold v-else />
        </el-icon>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        :collapse="sidebarCollapsed"
        router
      >
        <el-menu-item index="/admin">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="content">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/admin/courses">课程管理</el-menu-item>
          <el-menu-item index="/admin/chapters">章节管理</el-menu-item>
          <el-menu-item index="/admin/resources">资源管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/analytics">
          <el-icon><TrendCharts /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        
        <el-sub-menu index="community">
          <template #title>
            <el-icon><ChatDotRound /></el-icon>
            <span>社区管理</span>
          </template>
          <el-menu-item index="/admin/community/discussions">帖子管理</el-menu-item>
          <el-menu-item index="/admin/community/comments">评论管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admin/settings">基本设置</el-menu-item>
          <el-menu-item index="/admin/settings/permissions">权限管理</el-menu-item>
          <el-menu-item index="/admin/settings/logs">系统日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="admin-main">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Expand,
  Fold,
  Odometer,
  Document,
  User,
  TrendCharts,
  ChatDotRound,
  Setting
} from '@element-plus/icons-vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.admin-sidebar {
  width: 250px;
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #263445;
  color: white;
}

.logo {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-menu {
  border: none;
  background: #304156;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
  background: #304156;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: #263445 !important;
  color: #409eff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #409eff !important;
  color: white;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  color: #bfcbd9;
  background: #304156;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: #263445 !important;
  color: #409eff;
}

.admin-main {
  flex: 1;
  overflow: auto;
}
</style>
