import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { globSync } from 'glob'

const ROOT = process.cwd()
const POSTS_DIR = path.join(ROOT, 'content', 'blog')
const INDEX_DIR = path.join(ROOT, 'src', 'data', 'posts')
const INDEX_FP = path.join(INDEX_DIR, 'index.json')

// Simple in-memory cache to avoid reading disk on every request in dev
let _memIndex = null

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function getMdFiles() {
  // globSync is relatively fast, but for large repos we might want to cache this too in dev
  return globSync('**/*.mdx', { cwd: POSTS_DIR, nodir: true })
}

function buildIndexFromFS() {
  console.log('[PostIndex] Rebuilding index from FS...')
  const files = getMdFiles()
  const items = []
  for (const rel of files) {
    const fp = path.join(POSTS_DIR, rel)
    try {
      const raw = fs.readFileSync(fp, 'utf-8')
      const { data } = matter(raw)
      // Fix: Use relative path as slug, keeping directory structure
      // e.g. "life/japan.mdx" -> "life/japan"
      const slug = rel.replace(/\.mdx?$/, '')
      items.push({ slug, rel, data })
    } catch (e) {
      console.error(`[PostIndex] Error reading ${rel}:`, e)
    }
  }

  items.sort((a, b) => {
    const ap = a.data?.pinned || false
    const bp = b.data?.pinned || false
    if (ap && !bp) return -1
    if (!ap && bp) return 1
    const ad = new Date(a.data?.date || 0).getTime()
    const bd = new Date(b.data?.date || 0).getTime()
    return bd - ad
  })

  const index = { items, updatedAt: new Date().toISOString() }
  _memIndex = index
  return index
}

export function readPostsIndex() {
  if (_memIndex) return _memIndex

  ensureDir(INDEX_DIR)
  if (!fs.existsSync(INDEX_FP)) return null
  try {
    const raw = fs.readFileSync(INDEX_FP, 'utf-8')
    _memIndex = JSON.parse(raw)
    return _memIndex
  } catch {
    return null
  }
}

export function writePostsIndex(index) {
  ensureDir(INDEX_DIR)
  fs.writeFileSync(INDEX_FP, JSON.stringify(index, null, 2))
  _memIndex = index
  return index
}

export function getOrBuildPostsIndex() {
  // 1. Try to read existing index
  let idx = readPostsIndex()

  // 2. If no index, build it
  if (!idx || !Array.isArray(idx.items)) {
    return writePostsIndex(buildIndexFromFS())
  }

  // 3. In production, trust the built index (assuming it was built at build time)
  if (process.env.NODE_ENV === 'production') {
    return idx
  }

  // 4. In development, we want to detect changes.
  // Instead of checking mtime of EVERY file (which is O(N) and slow),
  // we can use a simpler heuristic or just rely on manual restart if needed,
  // BUT to fix the user's issue, we'll implement a lightweight check:
  // Check if file count matches. If so, we assume it's "good enough" for now to avoid the stack overflow loop.
  // A better dev experience would be to use a file watcher, but that's complex for this function.
  // For now, let's just rebuild if the file count is different.

  const fsFiles = getMdFiles()
  if (idx.items.length !== fsFiles.length) {
    console.log('[PostIndex] File count changed, rebuilding index...')
    return writePostsIndex(buildIndexFromFS())
  }

  // Optional: If you really need to detect content changes in dev without restart,
  // you could check the mtime of the *latest* modified file vs index.updatedAt.
  // But let's keep it safe and fast for now.

  return idx
}

export function findPostPathBySlug(slug) {
  const idx = getOrBuildPostsIndex()
  // Ensure slug matches exactly. 
  // Note: slug in index is now "dir/file" (no extension)
  const hit = idx?.items?.find(i => i.slug === slug)
  return hit ? path.join(POSTS_DIR, hit.rel) : null
}

export function listIndexedPosts() {
  const idx = getOrBuildPostsIndex()
  return idx.items.map(i => ({ slug: i.slug, ...i.data }))
}

export function listIndexedSlugs() {
  const idx = getOrBuildPostsIndex()
  return idx.items.map(i => i.slug)
}