import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import fs from 'fs'
import path from 'path'

const siteUrl = 'http://wynlx.cn'
const legacySitemapPaths = [
  '/articles/automated-blog/',
  '/articles/blog-automation-guide/',
  '/articles/n8n-workflow-guide/',
  '/articles/langchain4j-learning/',
  '/articles/xiaohongshu/',
  '/articles/server/',
  '/articles/image-prompts/',
  '/articles/u-disk/',
  '/articles/java-programming-guide',
  '/articles/markdown-syntax-guide',
  '/articles/obsidian-github-sync-config'
]

function isLegacySitemapPath(url) {
  const pathname = decodeURI(new URL(url, siteUrl).pathname)
  return legacySitemapPaths.some((path) => pathname.startsWith(path))
}

// ============================================================
// 公共侧边栏配置 - 统一管理所有 sidebar 选项
// ============================================================
const commonSidebarOptions = {
  // 标题读取优先级：frontmatter.title > H1 > 文件名
  useTitleFromFrontmatter: true,
  frontmatterTitleFieldName: 'title',
  useTitleFromFileHeading: true,

  // 文件夹标题与链接
  useFolderTitleFromIndexFile: true,
  useFolderLinkFromIndexFile: true,

  // 排序：使用 frontmatter.order 数字排序
  sortMenusByFrontmatterOrder: true,
  frontmatterOrderDefaultValue: 999,
  sortMenusByName: false,
  sortMenusOrderByDescending: false,

  // 标题格式化 - 中文站点建议关闭
  hyphenToSpace: true,
  underscoreToSpace: true,
  capitalizeFirst: false,
  capitalizeEachWords: false,

  // 排除规则
  excludeFilesByFrontmatterFieldName: 'sidebarExclude',

  // 调试受环境变量控制
  debugPrint: process.env.DEBUG_SIDEBAR === 'true'
}

function getFrontmatter(filePath) {
  try {
    const fullPath = path.join(process.cwd(), 'docs', filePath)
    const content = fs.readFileSync(fullPath, 'utf-8')
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!match) return {}
    const fm = {}
    match[1].split(/\r?\n/).forEach((line) => {
      const colonIdx = line.indexOf(':')
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim()
        const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
        fm[key] = value
      }
    })
    return fm
  } catch (e) {
    return {}
  }
}

// ============================================================
// 链接路径规范化函数
// ============================================================
function normalizeSidebarLink(link, resolvePath) {
  if (!link) return link

  // 不处理外链、锚点
  if (
    link.startsWith('http://') ||
    link.startsWith('https://') ||
    link.startsWith('#')
  ) {
    return link
  }

  // 规范化 resolvePath
  const prefix = resolvePath.endsWith('/')
    ? resolvePath
    : `${resolvePath}/`

  // 统一反斜杠为正斜杠
  let normalizedLink = link.replace(/\\/g, '/')

  // 如果已经是绝对路径，直接返回
  if (normalizedLink.startsWith('/')) {
    return normalizedLink.replace(/\/+/g, '/')
  }

  // 拼接前缀并去除重复斜杠
  return `${prefix}${normalizedLink}`.replace(/\/+/g, '/')
}

function fixSidebarPaths(items, resolvePath) {
  return items.map(item => {
    const next = { ...item }

    if (next.link) {
      next.link = normalizeSidebarLink(next.link, resolvePath)
      // 应用 sidebarTitle 替换
      const fm = getFrontmatter(next.link)
      if (fm.sidebarTitle) {
        next.text = fm.sidebarTitle
      }
    }

    if (Array.isArray(next.items)) {
      next.items = fixSidebarPaths(next.items, resolvePath)
    }

    return next
  })
}

// ============================================================
// 侧边栏生成函数
// ============================================================
function generateSidebarWithCorrectPaths(resolvePath, scanStartPath, options = {}) {
  const sidebar = generateSidebar({
    ...commonSidebarOptions,
    ...options,
    documentRootPath: 'docs',
    scanStartPath
  })

  return fixSidebarPaths(sidebar, resolvePath)
}

function renderSearchContent(src, env, md) {
  const frontmatter = src.match(/^---[\s\S]*?---/)?.[0] || ''
  const headings = src
    .split('\n')
    .filter((line) => /^#{1,6}\s+/.test(line))
    .join('\n')

  const html = md.render(`${frontmatter}\n\n${headings}`, env)
  return env.frontmatter?.search === false || env.frontmatter?.sidebarExclude ? '' : html
}

export default defineConfig({
  title: 'AI写作指令集合',
  description: '包含各种AI写作指令和教程的文档集合，涵盖多种写作场景和应用',
  
  // 设置源目录为docs
  srcDir: 'docs',
  
  // 忽略死链接检查
  ignoreDeadLinks: true,

  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items.filter((item) => !isLegacySitemapPath(item.url))
    }
  },
  
  // 服务器配置
  vite: {
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      cors: true,
      fs: {
        strict: false,
        allow: ['..', '../..']
      },
      // 使用默认的 HMR 端口以避免端口占用导致的客户端错误
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false
    }
  },
  
  // 主题配置
  themeConfig: {
    // 网站标题
    siteTitle: 'AI写作指令集合',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指令分类', link: '/categories/' },
      { text: '随笔文集', link: '/essays/' },
      { text: 'AI技术', link: '/tools/' },
      { text: 'Git 工作流', link: '/articles/git-workflow/' },
      { text: '技术文章', link: '/articles/' },
      { text: 'GitHub', link: 'https://github.com/yangbin09/tera-docs' }
    ],

    // 侧边栏 - 统一使用公共配置
    sidebar: {
      // ========== 主目录 ==========
      '/categories/': generateSidebarWithCorrectPaths('/categories/', 'categories', {
        collapsed: false,
        collapseDepth: 3
      }),

      '/tools/': generateSidebarWithCorrectPaths('/tools/', 'tools', {
        collapsed: false,
        collapseDepth: 3
      }),

      '/essays/': generateSidebarWithCorrectPaths('/essays/', 'essays', {
        collapsed: false,
        collapseDepth: 5,
        excludeDirs: ['mp3', 'images', 'article-images']
      }),

      '/articles/': generateSidebarWithCorrectPaths('/articles/', 'articles', {
        collapsed: false,
        collapseDepth: 3
      }),

    },

    // 搜索
    search: {
      provider: 'local',
      options: {
        _render: renderSearchContent,
        detailedView: false,
        miniSearch: {
          options: {
            fields: ['title', 'titles']
          }
        },
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yangbin09/tera-docs' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 AI写作指令集合'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/yangbin09/tera-docs/edit/master/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: 'AI写作指令集合' }],
    ['meta', { property: 'og:site_name', content: 'AI写作指令集合' }],
    ['meta', { property: 'og:description', content: '包含各种AI写作指令和教程的文档集合，涵盖多种写作场景和应用' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:image', content: `${siteUrl}/og-image.png` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'AI写作指令集合' }],
    ['meta', { name: 'twitter:description', content: '包含各种AI写作指令和教程的文档集合，涵盖多种写作场景和应用' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/og-image.png` }],
    ['script', {}, `(()=>{const{pathname:p,search:s,hash:h}=location;if(p==='/login.html'||p==='/login'){const r=new URLSearchParams(s).get('redirect')||'/';location.replace(r);return}const last=p.split('/').pop();if(!p.endsWith('/')&&last&&!last.includes('.'))location.replace(p+'.html'+s+h)})()`]
  ],

  // 语言配置
  lang: 'zh-CN',

  // 清理URL
  cleanUrls: true,

  // Markdown配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
