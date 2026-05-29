import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import ImageViewerP from '@davidingplus/vitepress-image-viewer'
import '@davidingplus/vitepress-image-viewer/style.css'

// Nolebase 插件
import { NolebaseEnhancedReadabilitiesPlugin, NolebaseEnhancedReadabilitiesMenu } from '@nolebase/vitepress-plugin-enhanced-readabilities'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'

import { NolebaseHighlightTargetedHeading } from '@nolebase/vitepress-plugin-highlight-targeted-heading'
import '@nolebase/vitepress-plugin-highlight-targeted-heading/client/style.css'

import { NolebaseInlineLinkPreviewPlugin } from '@nolebase/vitepress-plugin-inline-link-preview'
import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 高亮目标标题 - 在内容顶部渲染
      'layout-top': () => h(NolebaseHighlightTargetedHeading),
      // 阅读增强菜单 - 在导航栏右侧渲染
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu)
    })
  },
  enhanceApp(ctx) {
    ImageViewerP(ctx.app)
    ctx.app.use(NolebaseEnhancedReadabilitiesPlugin)
    ctx.app.use(NolebaseInlineLinkPreviewPlugin)
  }
}
