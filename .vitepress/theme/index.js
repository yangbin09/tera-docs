import DefaultTheme from 'vitepress/theme'
import PasswordGate from './components/PasswordGate.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    // 注册全局组件
    app.component('PasswordGate', PasswordGate)

    if (typeof window !== 'undefined') {
      const allowPaths = new Set(['/login.html', '/login'])

      function isAllowed(path) {
        return allowPaths.has(path)
      }

      function check(path) {
        const token = sessionStorage.getItem('site_auth')
        const exp = Number(sessionStorage.getItem('site_auth_exp') || '0')
        const now = Date.now()

        if (!isAllowed(path) && (!token || !exp || now > exp)) {
          const redirect = encodeURIComponent(path)
          // 使用 VitePress 的 router.go 进行跳转
          router.go(`/login.html?redirect=${redirect}`)
          return false
        }
        return true
      }

      // 首次加载时检查当前路径
      check(window.location.pathname)

      // 监听路由变化（VitePress 专有 API）
      if (typeof router.onBeforeRouteChange === 'function') {
        router.onBeforeRouteChange((to) => {
          check(to)
        })
      }
    }
  }
}