import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

const siteUrl = 'http://wynlx.cn'
const legacySitemapPaths = [
  '/articles/automated-blog/',
  '/articles/从0到1搭建一个自动化博客/',
  '/articles/从0到1搭建一个n8n工作流/',
  '/articles/从0到1学习LangChain4j/',
  '/articles/小红书/',
  '/articles/服务器/',
  '/articles/绘画提示词/',
  '/articles/U盘环境/',
  '/articles/Java编程指南',
  '/articles/Markdown语法说明',
  '/articles/Obsidian 配置 `Obsidian-GitHub-Sync'
]

function isLegacySitemapPath(url) {
  const pathname = decodeURI(new URL(url, siteUrl).pathname)
  return legacySitemapPaths.some((path) => pathname.startsWith(path))
}

// 自动化侧边栏路径修复函数
function generateSidebarWithCorrectPaths(routePrefix, scanStartPath, options = {}) {
  // 生成原始侧边栏
  const originalSidebar = generateSidebar({
    documentRootPath: '.',
    scanStartPath: scanStartPath,
    debugPrint: false,
    ...options
  })
  
  // 递归修复链接路径
  function fixPaths(items, prefix) {
    return items.map(item => {
      const newItem = { ...item }
      
      // 修复链接路径
      if (newItem.link && !newItem.link.startsWith(prefix)) {
        // 移除可能存在的前导斜杠，然后添加正确的前缀
        const cleanLink = newItem.link.replace(/^\/+/, '')
        newItem.link = `${prefix}${cleanLink}`
      }
      
      // 递归处理子项
      if (newItem.items && Array.isArray(newItem.items)) {
        newItem.items = fixPaths(newItem.items, prefix)
      }
      
      return newItem
    })
  }
  
  // 确保routePrefix以/开头和结尾
  const normalizedPrefix = routePrefix.startsWith('/') ? routePrefix : `/${routePrefix}`
  const finalPrefix = normalizedPrefix.endsWith('/') ? normalizedPrefix : `${normalizedPrefix}/`
  
  return fixPaths(originalSidebar, finalPrefix)
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

    // 侧边栏 - 使用自动化路径修复的 vitepress-sidebar
    sidebar: {
      // ========== Categories 目录 ==========
      '/categories/': generateSidebarWithCorrectPaths('/categories/', 'docs/categories', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 3,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // ========== Tools 目录 ==========
      '/tools/': generateSidebarWithCorrectPaths('/tools/', 'docs/tools', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 3,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // ========== Essays 目录（支持深层嵌套） ==========
      '/essays/': generateSidebarWithCorrectPaths('/essays/', 'docs/essays', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 5,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude',
        excludeDirs: ['mp3', 'images', 'article-images']
      }),

      // ========== Articles 主目录 ==========
      '/articles/': generateSidebarWithCorrectPaths('/articles/', 'docs/articles', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 3,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // ========== Articles 子目录侧边栏 ==========

      // Git 工作流
      '/articles/git-workflow/': generateSidebarWithCorrectPaths('/articles/git-workflow/', 'docs/articles/git-workflow', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // n8n 工作流
      '/articles/n8n-workflow/': generateSidebarWithCorrectPaths('/articles/n8n-workflow/', 'docs/articles/n8n-workflow', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // Markdown 指南
      '/articles/markdown-guide/': generateSidebarWithCorrectPaths('/articles/markdown-guide/', 'docs/articles/markdown-guide', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // 绘画提示词
      '/articles/image-prompts/': generateSidebarWithCorrectPaths('/articles/image-prompts/', 'docs/articles/image-prompts', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // 服务器
      '/articles/server/': generateSidebarWithCorrectPaths('/articles/server/', 'docs/articles/server', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // 小红书
      '/articles/xiaohongshu/': generateSidebarWithCorrectPaths('/articles/xiaohongshu/', 'docs/articles/xiaohongshu', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // Java 指南
      '/articles/java-guide/': generateSidebarWithCorrectPaths('/articles/java-guide/', 'docs/articles/java-guide', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // LangChain4j
      '/articles/langchain4j-getting-started/': generateSidebarWithCorrectPaths('/articles/langchain4j-getting-started/', 'docs/articles/langchain4j-getting-started', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // 自动化博客
      '/articles/automated-blog/': generateSidebarWithCorrectPaths('/articles/automated-blog/', 'docs/articles/automated-blog', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // Obsidian GitHub Sync
      '/articles/obsidian-github-sync/': generateSidebarWithCorrectPaths('/articles/obsidian-github-sync/', 'docs/articles/obsidian-github-sync', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // U盘环境
      '/articles/u-disk/': generateSidebarWithCorrectPaths('/articles/u-disk/', 'docs/articles/u-disk', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      // 中文命名的子目录（使用别名映射）
      '/articles/服务器/': generateSidebarWithCorrectPaths('/articles/服务器/', 'docs/articles/服务器', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      '/articles/绘画提示词/': generateSidebarWithCorrectPaths('/articles/绘画提示词/', 'docs/articles/绘画提示词', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      '/articles/小红书/': generateSidebarWithCorrectPaths('/articles/小红书/', 'docs/articles/小红书', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      '/articles/U盘环境/': generateSidebarWithCorrectPaths('/articles/U盘环境/', 'docs/articles/U盘环境', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      '/articles/从0到1搭建一个自动化博客/': generateSidebarWithCorrectPaths('/articles/从0到1搭建一个自动化博客/', 'docs/articles/从0到1搭建一个自动化博客', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      '/articles/从0到1搭建一个n8n工作流/': generateSidebarWithCorrectPaths('/articles/从0到1搭建一个n8n工作流/', 'docs/articles/从0到1搭建一个n8n工作流', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      }),

      '/articles/从0到1学习LangChain4j/': generateSidebarWithCorrectPaths('/articles/从0到1学习LangChain4j/', 'docs/articles/从0到1学习LangChain4j', {
        hyphenToSpace: true,
        underscoreToSpace: true,
        capitalizeFirst: true,
        capitalizeEachWords: true,
        collapsed: false,
        collapseDepth: 2,
        sortMenusByName: true,
        sortMenusOrderByDescending: false,
        frontmatterTitleFieldName: 'title',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        excludeFilesByFrontmatterFieldName: 'sidebarExclude'
      })
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
