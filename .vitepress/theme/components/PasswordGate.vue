<template>
  <div class="password-gate">
    <h1>访问授权</h1>
    <p class="tip">请输入今日访问码以解锁站点内容。</p>

    <input
      v-model="password"
      type="text"
      placeholder="6位访问码"
      :disabled="submitting || isBlocked"
    />
    <button @click="onSubmit" :disabled="submitting || isBlocked">
      {{ submitting ? '验证中…' : '进入' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="isBlocked" class="blocked">
      尝试次数过多，已暂时锁定。稍后再试。
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const password = ref('')
const error = ref('')
const submitting = ref(false)
const isBlocked = ref(false)
const blockedUntil = ref(0)

const MAX_ATTEMPTS = 5
const BLOCK_MS = 60 * 1000 // 1分钟临时锁定
const ATTEMPT_KEY = 'site_auth_attempts'
const BLOCK_KEY = 'site_auth_block_until'

function getLocalYYYYMMDD(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

function toHex(buf) {
  const arr = Array.from(new Uint8Array(buf))
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(str) {
  const enc = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(str))
  return toHex(digest)
}

function getSecret() {
  return import.meta.env.VITE_SITE_ACCESS_SECRET || 'CHANGE_ME_SECRET'
}

async function computeExpectedTokenForDate(dateStr) {
  const secret = getSecret()
  return await sha256Hex(secret + dateStr)
}

async function isValidPassword(input) {
  const pwd = String(input).trim()
  if (!pwd) return false
  const today = getLocalYYYYMMDD(new Date())
  const yesterday = getLocalYYYYMMDD(new Date(Date.now() - 24 * 60 * 60 * 1000))

  const tokenToday = await computeExpectedTokenForDate(today)
  const tokenYesterday = await computeExpectedTokenForDate(yesterday)

  const expectedToday = tokenToday.slice(0, 6).toUpperCase()
  const expectedYesterday = tokenYesterday.slice(0, 6).toUpperCase()

  return pwd.toUpperCase() === expectedToday || pwd.toUpperCase() === expectedYesterday
}

function readBlockState() {
  const now = Date.now()
  const bu = Number(localStorage.getItem(BLOCK_KEY) || '0')
  blockedUntil.value = bu
  isBlocked.value = bu > now
}

function recordFailedAttempt() {
  const count = Number(localStorage.getItem(ATTEMPT_KEY) || '0') + 1
  localStorage.setItem(ATTEMPT_KEY, String(count))
  if (count >= MAX_ATTEMPTS) {
    const bu = Date.now() + BLOCK_MS
    localStorage.setItem(BLOCK_KEY, String(bu))
    localStorage.setItem(ATTEMPT_KEY, '0')
  }
}

function resetAttempts() {
  localStorage.removeItem(ATTEMPT_KEY)
  localStorage.removeItem(BLOCK_KEY)
}

async function onSubmit() {
  readBlockState()
  if (isBlocked.value) {
    error.value = '尝试次数过多，已暂时锁定。请稍后再试。'
    return
  }
  submitting.value = true
  try {
    const ok = await isValidPassword(password.value)
    if (!ok) {
      recordFailedAttempt()
      readBlockState()
      error.value = isBlocked.value
        ? '尝试次数过多，已暂时锁定。请稍后再试。'
        : '密码不正确，请重试。'
      return
    }
    resetAttempts()
    const today = getLocalYYYYMMDD(new Date())
    const token = await computeExpectedTokenForDate(today)
    const exp = Date.now() + 60 * 60 * 1000 // 会话1小时有效
    sessionStorage.setItem('site_auth', token)
    sessionStorage.setItem('site_auth_exp', String(exp))

    // 读取重定向目标
    const sp = new URLSearchParams(window.location.search)
    const redirectPath = sp.get('redirect') ? decodeURIComponent(sp.get('redirect')) : '/'
    window.location.href = redirectPath
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  readBlockState()
})
</script>

<style>
.password-gate {
  max-width: 440px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.password-gate h1 {
  font-size: 20px;
  margin-bottom: 12px;
}
.password-gate .tip {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}
.password-gate input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
}
.password-gate button {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
}
.password-gate .error {
  color: #b00020;
  margin-top: 8px;
}
.password-gate .blocked {
  color: #b00020;
  font-size: 13px;
}
</style>