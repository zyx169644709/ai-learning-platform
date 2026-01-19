// 全局通知工具
export const notification = {
  // 显示错误提示
  error(message: string, duration: number = 3000) {
    this.show(message, 'error', duration)
  },

  // 显示成功提示
  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration)
  },

  // 显示警告提示
  warning(message: string, duration: number = 3000) {
    this.show(message, 'warning', duration)
  },

  // 显示信息提示
  info(message: string, duration: number = 3000) {
    this.show(message, 'info', duration)
  },

  // 核心显示方法
  show(message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info', duration: number = 3000) {
    // 创建通知容器
    const container = document.getElementById('notification-container') || this.createContainer()

    // 创建通知元素
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    
    // 图标映射
    const icons = {
      error: '❌',
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️'
    }

    notification.innerHTML = `
      <span class="notification-icon">${icons[type]}</span>
      <span class="notification-message">${message}</span>
    `

    // 添加到容器
    container.appendChild(notification)

    // 触发动画
    setTimeout(() => {
      notification.classList.add('notification-show')
    }, 10)

    // 自动移除
    setTimeout(() => {
      notification.classList.remove('notification-show')
      setTimeout(() => {
        container.removeChild(notification)
      }, 300)
    }, duration)
  },

  // 创建通知容器
  createContainer() {
    const container = document.createElement('div')
    container.id = 'notification-container'
    container.className = 'notification-container'
    document.body.appendChild(container)

    // 添加样式
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style')
      style.id = 'notification-styles'
      style.textContent = `
        .notification-container {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .notification {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-size: 14px;
          font-weight: 500;
          min-width: 300px;
          max-width: 400px;
          opacity: 0;
          transform: translateX(400px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: auto;
        }

        .notification-show {
          opacity: 1;
          transform: translateX(0);
        }

        .notification-error {
          background: #fee;
          color: #c00;
          border-left: 4px solid #c00;
        }

        .notification-success {
          background: #efe;
          color: #0a0;
          border-left: 4px solid #0a0;
        }

        .notification-warning {
          background: #ffe;
          color: #c90;
          border-left: 4px solid #c90;
        }

        .notification-info {
          background: #eef;
          color: #09c;
          border-left: 4px solid #09c;
        }

        .notification-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .notification-message {
          flex: 1;
          line-height: 1.5;
        }

        /* 暗色主题适配 */
        [data-theme="dark"] .notification-error {
          background: #4a1a1a;
          color: #ff6b6b;
        }

        [data-theme="dark"] .notification-success {
          background: #1a4a1a;
          color: #51cf66;
        }

        [data-theme="dark"] .notification-warning {
          background: #4a3a1a;
          color: #ffd43b;
        }

        [data-theme="dark"] .notification-info {
          background: #1a3a4a;
          color: #4dabf7;
        }
      `
      document.head.appendChild(style)
    }

    return container
  }
}
