import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const docsDir = resolve(root, 'docs')
const markdownExtensions = new Set(['.md'])
const imageExtensions = new Set(['.png', '.jpg', '.jpeg'])
const minBytesToConvert = 200 * 1024
const minSavingsRatio = 0.15

const stats = {
  filesUpdated: 0,
  imagesConverted: 0,
  bytesBefore: 0,
  bytesAfter: 0
}

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
  const match = value.match(/^([^?#]*)(.*)$/)
  return {
    path: match?.[1] || value,
    suffix: match?.[2] || ''
  }
}

function decodePath(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function encodeRelativePath(value) {
  return value
    .split('/')
    .map((part) => encodeURIComponent(part).replace(/%20/g, '%20'))
    .join('/')
}

function isLocalPath(value) {
  return value && !value.startsWith('#') && !/^[a-z][a-z0-9+.-]*:/i.test(value)
}

function resolveLocalAsset(markdownFile, rawTarget) {
  const cleanTarget = stripQueryAndHash(rawTarget.trim().replace(/^<|>$/g, '')).path
  if (!isLocalPath(cleanTarget)) return null

  const decodedTarget = decodePath(cleanTarget)
  if (!imageExtensions.has(extname(decodedTarget).toLowerCase())) return null

  if (decodedTarget.startsWith('/')) {
    return resolve(docsDir, `.${decodedTarget}`)
  }

  return resolve(dirname(markdownFile), decodedTarget)
}

function makeReplacement(markdownFile, rawTarget, webpPath) {
  const trimmed = rawTarget.trim().replace(/^<|>$/g, '')
  const { suffix } = stripQueryAndHash(trimmed)
  const currentPath = stripQueryAndHash(trimmed).path

  if (currentPath.startsWith('/')) {
    const rootRelative = relative(docsDir, webpPath).replace(/\\/g, '/')
    return `/${encodeRelativePath(rootRelative)}${suffix}`
  }

  const nextRelative = relative(dirname(markdownFile), webpPath).replace(/\\/g, '/')
  const normalized = nextRelative.startsWith('.') ? nextRelative : `./${nextRelative}`
  return `${encodeRelativePath(normalized)}${suffix}`
}

async function convertImage(assetPath) {
  if (!existsSync(assetPath) || !statSync(assetPath).isFile()) return null

  const originalSize = statSync(assetPath).size
  if (originalSize < minBytesToConvert) return null

  const webpPath = assetPath.replace(/\.(png|jpe?g)$/i, '.webp')
  const buffer = await sharp(assetPath)
    .webp({
      quality: 82,
      effort: 6
    })
    .toBuffer()

  if (buffer.length >= originalSize * (1 - minSavingsRatio)) return null

  writeFileSync(webpPath, buffer)
  rmSync(assetPath)

  stats.imagesConverted += 1
  stats.bytesBefore += originalSize
  stats.bytesAfter += buffer.length

  return webpPath
}

const conversions = new Map()

for (const markdownFile of walk(docsDir)) {
  let content = readFileSync(markdownFile, 'utf8')
  let updated = content

  const markdownImagePattern = /!\[([^\]]*)]\(([^)]+)\)/g
  for (const match of content.matchAll(markdownImagePattern)) {
    const assetPath = resolveLocalAsset(markdownFile, match[2])
    if (!assetPath) continue

    let webpPath = conversions.get(assetPath)
    if (webpPath === undefined) {
      webpPath = await convertImage(assetPath)
      conversions.set(assetPath, webpPath)
    }

    if (!webpPath) continue

    const replacement = makeReplacement(markdownFile, match[2], webpPath)
    updated = updated.replace(match[0], `![${match[1]}](${replacement})`)
  }

  const htmlImagePattern = /<img\b([^>]*?)\bsrc=(["'])(.*?)\2([^>]*)>/gi
  for (const match of content.matchAll(htmlImagePattern)) {
    const assetPath = resolveLocalAsset(markdownFile, match[3])
    if (!assetPath) continue

    let webpPath = conversions.get(assetPath)
    if (webpPath === undefined) {
      webpPath = await convertImage(assetPath)
      conversions.set(assetPath, webpPath)
    }

    if (!webpPath) continue

    const replacement = makeReplacement(markdownFile, match[3], webpPath)
    updated = updated.replace(match[0], `<img${match[1]}src=${match[2]}${replacement}${match[2]}${match[4]}>`)
  }

  if (updated !== content) {
    writeFileSync(markdownFile, updated)
    stats.filesUpdated += 1
  }
}

const saved = stats.bytesBefore - stats.bytesAfter
console.log(`Updated markdown files: ${stats.filesUpdated}`)
console.log(`Converted images: ${stats.imagesConverted}`)
console.log(`Saved: ${(saved / 1024 / 1024).toFixed(2)} MB`)
