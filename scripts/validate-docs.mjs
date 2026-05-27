import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'

const root = process.cwd()
const docsDir = resolve(root, 'docs')
const markdownExtensions = new Set(['.md'])

const errors = []

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      walk(path, files)
      continue
    }

    if (entry.isFile() && markdownExtensions.has(extname(entry.name))) {
      files.push(path)
    }
  }

  return files
}

function stripQueryAndHash(value) {
  return value.split(/[?#]/, 1)[0]
}

function decodePath(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function resolveLocalAsset(markdownFile, rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, '').split(/\s+["']/)[0]
  const cleanTarget = decodePath(stripQueryAndHash(target))

  if (
    !cleanTarget ||
    cleanTarget.startsWith('#') ||
    /^[a-z][a-z0-9+.-]*:/i.test(cleanTarget)
  ) {
    return null
  }

  if (cleanTarget.startsWith('/')) {
    return resolve(docsDir, `.${cleanTarget}`)
  }

  return resolve(dirname(markdownFile), cleanTarget)
}

function validateMarkdownImages(markdownFile, content) {
  const imagePattern = /!\[[^\]]*]\(([^)]+)\)/g
  const htmlImagePattern = /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi

  for (const match of content.matchAll(imagePattern)) {
    const assetPath = resolveLocalAsset(markdownFile, match[1])
    if (!assetPath) continue

    if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
      errors.push(`${markdownFile}: missing image asset ${match[1]}`)
    }
  }

  for (const match of content.matchAll(htmlImagePattern)) {
    const assetPath = resolveLocalAsset(markdownFile, match[2])
    if (!assetPath) continue

    if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
      errors.push(`${markdownFile}: missing image asset ${match[2]}`)
    }
  }
}

function validateRedirectPage(markdownFile, content) {
  if (!content.includes('window.location.replace(')) return

  if (!content.includes('sidebarExclude: true')) {
    errors.push(`${markdownFile}: redirect page should set sidebarExclude: true`)
  }
}

function validateIndexTitle(markdownFile, content) {
  if (!markdownFile.replace(/\\/g, '/').endsWith('/index.md')) return
  if (content.includes('layout: home') || content.includes('window.location.replace(')) return

  if (!/^#\s+.+$/m.test(content)) {
    errors.push(`${markdownFile}: index page should include an H1 heading`)
  }
}

for (const markdownFile of walk(docsDir)) {
  const content = readFileSync(markdownFile, 'utf8')
  validateMarkdownImages(markdownFile, content)
  validateRedirectPage(markdownFile, content)
  validateIndexTitle(markdownFile, content)
}

if (errors.length > 0) {
  console.error(`Documentation validation failed with ${errors.length} issue(s):`)
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Documentation validation passed.')
