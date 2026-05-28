import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
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
  return legacySitemapPaths.some((p) => pathname.startsWith(p))
}

const commonSidebarOptions = {
  useTitleFromFrontmatter: true,
  frontmatterTitleFieldName: 'title',
  useTitleFromFileHeading: true,
  useFolderTitleFromIndexFile: true,
  useFolderLinkFromIndexFile: true,
  sortMenusByFrontmatterOrder: true,
  frontmatterOrderDefaultValue: 999,
  sortMenusByName: false,
  sortMenusOrderByDescending: false,
  hyphenToSpace: true,
  underscoreToSpace: true,
  capitalizeFirst: false,
  capitalizeEachWords: false,
  excludeFilesByFrontmatterFieldName: 'sidebarExclude',
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

function normalizeSidebarLink(link, resolvePath) {
  if (!link) return link
  if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('#')) {
    return link
  }
  const prefix = resolvePath.endsWith('/') ? resolvePath : `${resolvePath}/`
  let normalizedLink = link.replace(/\\/g, '/')
  if (normalizedLink.startsWith('/')) {
    return normalizedLink.replace(/\/+/g, '/')
  }
  return `${prefix}${normalizedLink}`.replace(/\/+/g, '/')
}

function fixSidebarPaths(items, resolvePath, scanStartPath) {
  return items.map((item) => {
    const next = { ...item }
    if (next.link) {
      next.link = normalizeSidebarLink(next.link, resolvePath)
      const filePath = scanStartPath + '/' + next.link + '.md'
      const fm = getFrontmatter(filePath)
      if (fm.sidebarTitle) {
        next.text = fm.sidebarTitle
      }
    }
    if (Array.isArray(next.items)) {
      next.items = fixSidebarPaths(next.items, resolvePath, scanStartPath)
    }
    return next
  })
}

function generateSidebarWithCorrectPaths(resolvePath, scanStartPath, options = {}) {
  const sidebar = generateSidebar({
    ...commonSidebarOptions,
    ...options,
    documentRootPath: 'docs',
    scanStartPath
  })
  return fixSidebarPaths(sidebar, resolvePath, scanStartPath)
}

function renderSearchContent(src, env, md) {
  const frontmatter = src.match(/^---[\s\S]*?---/)?.[0] || ''
  const headings = src.split('\n').filter((line) => /^#{1,6}\s+/.test(line)).join('\n')
  const html = md.render(`${frontmatter}\n\n${headings}`, env)
  return env.frontmatter?.search === false || env.frontmatter?.sidebarExclude ? '' : html
}

export default withMermaid(defineConfig({
  title: 'AI写作指令集合',
  description: '包含各种AI写作指令和教程的文档集合，涵盖多种写作场景和应用',
  srcDir: 'docs',
  ignoreDeadLinks: true,

  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items.filter((item) => !isLegacySitemapPath(item.url))
    }
  },

  vite: {
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      cors: true,
      fs: {
        strict: false,
        allow: ['..', '../..']
      }
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false
    },
    plugins: [
      groupIconVitePlugin()
    ]
  },

  themeConfig: {
    siteTitle: 'AI写作指令集合',
    nav: [
      { text: '首页', link: '/' },
      { text: '指令分类', link: '/categories/' },
      { text: '随笔文集', link: '/essays/' },
      { text: 'AI技术', link: '/tools/' },
      { text: 'Git 工作流', link: '/articles/git-workflow/' },
      { text: '技术文章', link: '/articles/' },
      { text: 'GitHub', link: 'https://github.com/yangbin09/tera-docs' }
    ],
    sidebar: {
      '/categories/': generateSidebarWithCorrectPaths('/categories/', 'categories', { collapsed: false, collapseDepth: 3 }),
      '/tools/': generateSidebarWithCorrectPaths('/tools/', 'tools', { collapsed: false, collapseDepth: 3 }),
      '/essays/': generateSidebarWithCorrectPaths('/essays/', 'essays', { collapsed: false, collapseDepth: 5, excludeDirs: ['mp3', 'images', 'article-images'] }),
      '/articles/': generateSidebarWithCorrectPaths('/articles/', 'articles', { collapsed: false, collapseDepth: 3 })
    },
    search: {
      provider: 'local',
      options: {
        _render: renderSearchContent,
        detailedView: false,
        miniSearch: {
          options: { fields: ['title', 'titles'] }
        },
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换' }
          }
        }
      }
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/yangbin09/tera-docs' }],
    footer: { message: '基于 MIT 许可发布', copyright: 'Copyright © 2025 AI写作指令集合' },
    editLink: { pattern: 'https://github.com/yangbin09/tera-docs/edit/master/docs/:path', text: '在 GitHub 上编辑此页面' },
    lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'short', timeStyle: 'medium' } }
  },

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

  lang: 'zh-CN',
  cleanUrls: true,

  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    config(md) {
      md.use(groupIconMdPlugin)
    }
  },

  mermaid: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#3c82f6',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#e5e7eb',
      lineColor: '#6b7280',
      secondaryColor: '#f3f4f6',
      tertiaryColor: '#f9fafb'
    }
  }
}))
