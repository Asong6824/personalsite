#!/usr/bin/env node
import { getOrBuildPostsIndex } from '../src/lib/post-index'
import { CHANNELS_CONFIG } from '../src/lib/channels'

async function main() {
  const idx = getOrBuildPostsIndex()
  const count = Array.isArray(idx?.items) ? idx.items.length : 0
  console.log(`[posts-index] ready with ${count} items at ${idx?.updatedAt}`)

  // Build set of all channel/column route pairs that could conflict with articles
  const columnRoutes = new Set()
  for (const [chKey, chConfig] of Object.entries(CHANNELS_CONFIG)) {
    for (const colKey of Object.keys(chConfig.columns || {})) {
      columnRoutes.add(`${chKey}/${colKey}`)
    }
  }

  const warnings: string[] = []
  const errors: string[] = []

  for (const item of idx?.items || []) {
    const post = (item.data || {}) as Record<string, any>
    const slug = item.slug || 'unknown'
    const rel = item.rel || 'unknown'

    // 1. Detect route conflicts: 2-segment slugs that match a channel/column route
    const segments = slug.split('/')
    if (segments.length === 2) {
      const route = segments.join('/')
      if (columnRoutes.has(route)) {
        warnings.push(`[CONFLICT] ${rel} → URL /blog/${slug} will be intercepted by column route /blog/${route}. The article will be inaccessible.`)
      }
    }

    // 2. Warn about slug override mismatch (if frontmatter slug differs from filename)
    const fileName = rel.replace(/\.mdx?$/, '').split('/').pop()
    if (post.slug && post.slug.trim() !== fileName) {
      // This is now a valid use case since slug overrides filename
      // Only warn if the slug contains invalid characters
      const fmSlug = post.slug.trim()
      if (/[\\/]/.test(fmSlug) || fmSlug.startsWith('.')) {
        warnings.push(`[INVALID] ${rel}: frontmatter slug "${fmSlug}" contains invalid characters. Using filename instead.`)
      }
    }

    // 3. Validate the classification required by listIndexedPosts()
    if (!post.channel || !CHANNELS_CONFIG[post.channel]) {
      errors.push(`[CONFIG] ${rel}: missing or invalid channel '${post.channel ?? ''}'`)
    } else if (!post.column || !CHANNELS_CONFIG[post.channel].columns?.[post.column]) {
      errors.push(`[CONFIG] ${rel}: missing or invalid column '${post.column ?? ''}' in channel '${post.channel}'`)
    }
  }

  if (errors.length > 0) {
    console.error('\n[posts-index] validation errors:')
    for (const error of errors) {
      console.error(`  ${error}`)
    }
    process.exitCode = 1
    return
  }

  if (warnings.length > 0) {
    console.warn('\n[posts-index] validation warnings:')
    for (const w of warnings) {
      console.warn(`  ${w}`)
    }
  } else {
    console.log('[posts-index] validation passed, no issues found.')
  }
}

main().catch(err => {
  console.error('[posts-index] error:', err)
  process.exit(1)
})
