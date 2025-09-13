<template>
  <div class="page edit-profile">
    <h2 class="title">编辑个人资料</h2>
    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="label">用户名</span>
        <input class="input" v-model.trim="form.username" type="text" placeholder="输入新的用户名" required />
      </label>

      <label class="field">
        <span class="label">电子邮箱</span>
        <input class="input" v-model.trim="form.email" type="email" placeholder="name@example.com" required />
      </label>

      <div class="actions">
        <button class="btn primary" type="submit" :disabled="submitting">保存</button>
        <button class="btn" type="button" @click="goBack" :disabled="submitting">取消</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'

interface EditForm { username: string; email: string }

const router = useRouter()
const userStore = useUserStore()
const form = reactive<EditForm>({ username: '', email: '' })
const submitting = ref(false)

onMounted(async () => {
  try {
    const res = await userService.getProfile()
    if (res?.success && res.data?.user) {
      form.username = res.data.user.username || ''
      form.email = res.data.user.email || ''
    }
  } catch {}
})

const onSubmit = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    const payload: Partial<EditForm> = { username: form.username, email: form.email }
    const res = await userService.updateProfile(payload)
    if (res?.success) {
      // 更新全局 store，确保 Profile 页面立即显示最新数据
      try {
        if (res.data?.user) {
          userStore.userInfo = { ...userStore.userInfo, ...res.data.user } as any
        } else {
          await userStore.loadUser()
        }
      } catch {}
      // 同步本地缓存（若有）
      try {
        const raw = localStorage.getItem('userInfo')
        if (raw) {
          const cached = JSON.parse(raw)
          localStorage.setItem('userInfo', JSON.stringify({ ...cached, username: form.username, email: form.email }))
        }
      } catch {}
      router.push('/profile')
    }
  } catch (e) {
    console.error('更新资料失败', e)
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.back()
</script>

<style scoped>
.edit-profile { padding: 24px; }
.title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.form { max-width: 520px; display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 13px; color: var(--text-secondary); }
.input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.actions { display: flex; gap: 12px; margin-top: 8px; }
.btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
}
.btn.primary {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}
.btn:disabled { opacity: .6; cursor: not-allowed; }
</style>


