import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
import fs from 'fs'
import path from 'path'

const siteUrl = 'https://wynlx.cn'
const siteTitle = 'AI写作指令集合'
const siteDescription = '包含各种AI写作指令和教程的文档集合，涵盖多种写作场景和应用'
const defaultOgImage = '/og-image.png'
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
      const originalLink = next.link  // 保存原始 link
      next.link = normalizeSidebarLink(next.link, resolvePath)
      // 用原始 link 拼接 filePath，避免 resolvePath 前缀导致路径重复
      const filePath = scanStartPath + '/' + originalLink + '.md'
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

function getCleanPath(relativePath) {
  let pagePath = relativePath.replace(/\\/g, '/')
  if (pagePath === 'index.md') {
    pagePath = ''
  } else if (pagePath.endsWith('/index.md')) {
    pagePath = pagePath.slice(0, -'index.md'.length)
  } else {
    pagePath = pagePath.replace(/\.md$/, '')
  }
  return `/${pagePath}`.replace(/\/+/g, '/')
}

function getPageUrl(pageData) {
  return new URL(getCleanPath(pageData.relativePath), siteUrl).href
}

function getAbsoluteUrl(url) {
  return new URL(url || defaultOgImage, siteUrl).href
}

function getPageImage(frontmatter) {
  return getAbsoluteUrl(frontmatter.ogImage || frontmatter.image || defaultOgImage)
}

function getPageDescription(pageData, fallbackDescription) {
  return pageData.frontmatter.description || fallbackDescription || siteDescription
}

function getPageTitle(pageData) {
  return pageData.frontmatter.ogTitle || pageData.title || siteTitle
}

function createCleanUrlFiles(outDir) {
  let count = 0

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(entryPath)
        continue
      }
      if (!entry.isFile() || !entry.name.endsWith('.html') || entry.name === 'index.html' || entry.name === '404.html') {
        continue
      }

      const cleanUrlFile = path.join(dir, entry.name.slice(0, -'.html'.length))
      if (fs.existsSync(cleanUrlFile)) {
        continue
      }

      fs.copyFileSync(entryPath, cleanUrlFile)
      count += 1
    }
  }

  walk(outDir)
  return count
}

function getHtmlFiles(outDir) {
  const files = []

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(entryPath)
        continue
      }
      if (!entry.isFile()) {
        continue
      }

      const isHtml = entry.name.endsWith('.html')
      const hasExtension = path.extname(entry.name) !== ''
      if (isHtml || !hasExtension) {
        files.push(entryPath)
      }
    }
  }

  walk(outDir)
  return files
}

function moveShareMetaToHeadStart(outDir) {
  let count = 0

  for (const file of getHtmlFiles(outDir)) {
    const html = fs.readFileSync(file, 'utf-8')
    const blockStart = html.indexOf('    <link rel="canonical"')
    const lastMetaStart = html.indexOf('    <meta name="twitter:image"', blockStart)
    const titleEnd = html.indexOf('</title>')
    if (blockStart === -1 || lastMetaStart === -1 || titleEnd === -1 || blockStart < titleEnd) {
      continue
    }

    const blockEnd = html.indexOf('\n', lastMetaStart)
    if (blockEnd === -1) {
      continue
    }

    const shareMetaBlock = html.slice(blockStart, blockEnd + 1)
    const withoutShareMeta = html.slice(0, blockStart) + html.slice(blockEnd + 1)
    const insertAt = withoutShareMeta.indexOf('\n', titleEnd) + 1
    if (insertAt === 0) {
      continue
    }

    fs.writeFileSync(
      file,
      `${withoutShareMeta.slice(0, insertAt)}${shareMetaBlock}${withoutShareMeta.slice(insertAt)}`
    )
    count += 1
  }

  return count
}

export default withMermaid(defineConfig({
  title: siteTitle,
  description: siteDescription,
  srcDir: 'docs',
  ignoreDeadLinks: true,

  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items.filter((item) => !isLegacySitemapPath(item.url))
    }
  },

  transformPageData(pageData) {
    if (pageData.frontmatter.description) {
      return {
        description: pageData.frontmatter.description
      }
    }
  },

  transformHead({ pageData, description }) {
    const frontmatter = pageData.frontmatter
    const title = getPageTitle(pageData)
    const pageDescription = getPageDescription(pageData, description)
    const pageUrl = getPageUrl(pageData)
    const pageImage = getPageImage(frontmatter)
    const ogType = frontmatter.ogType || (pageData.relativePath === 'index.md' ? 'website' : 'article')

    return [
      ['link', { rel: 'canonical', href: pageUrl }],
      ['meta', { property: 'og:type', content: ogType }],
      ['meta', { property: 'og:locale', content: 'zh-CN' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:site_name', content: siteTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: pageUrl }],
      ['meta', { property: 'og:image', content: pageImage }],
      ['meta', { property: 'og:image:secure_url', content: pageImage }],
      ['meta', { property: 'og:image:type', content: 'image/png' }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { name: 'title', content: title }],
      ['meta', { itemprop: 'name', content: title }],
      ['meta', { itemprop: 'description', content: pageDescription }],
      ['meta', { itemprop: 'image', content: pageImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { name: 'twitter:image', content: pageImage }]
    ]
  },

  buildEnd(siteConfig) {
    const cleanUrlCount = createCleanUrlFiles(siteConfig.outDir)
    const prioritizedMetaCount = moveShareMetaToHeadStart(siteConfig.outDir)
    console.log(`Generated ${cleanUrlCount} clean URL files.`)
    console.log(`Prioritized share meta in ${prioritizedMetaCount} HTML files.`)
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
    ssr: {
      noExternal: [
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/vitepress-plugin-highlight-targeted-heading',
        '@nolebase/vitepress-plugin-inline-link-preview',
        '@nolebase/vitepress-plugin-meta',
        '@nolebase/vitepress-plugin-og-image',
        '@nolebase/ui',
        '@davidingplus/vitepress-image-viewer'
      ]
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
      { text: '技术教程', link: '/tutorials/' },
      { text: '随笔文集', link: '/essays/' },
      { text: 'GitHub', link: 'https://github.com/yangbin09/tera-docs' }
    ],
    sidebar: {
      '/categories/': generateSidebarWithCorrectPaths('/categories/', 'categories', { collapsed: false, collapseDepth: 3 }),
      '/tutorials/': generateSidebarWithCorrectPaths('/tutorials/', 'tutorials', { collapsed: false, collapseDepth: 3 }),
      '/essays/': generateSidebarWithCorrectPaths('/essays/', 'essays', { collapsed: false, collapseDepth: 5, excludeDirs: ['mp3', 'images', 'article-images'] })
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
    ['meta', { name: 'theme-color', content: '#3c82f6' }]
  ],

  lang: 'zh-CN',
  cleanUrls: true,

  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(InlineLinkPreviewElementTransform)
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
