import DefaultTheme from 'vitepress/theme'
import ImageViewerP from '@davidingplus/vitepress-image-viewer'
import '@davidingplus/vitepress-image-viewer/style.css'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    ImageViewerP(ctx.app)
  }
}
