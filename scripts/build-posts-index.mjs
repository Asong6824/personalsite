#!/usr/bin/env node
import { getOrBuildPostsIndex } from '../src/lib/post-index.js'

async function main() {
  const idx = getOrBuildPostsIndex()
  const count = Array.isArray(idx?.items) ? idx.items.length : 0
  console.log(`[posts-index] ready with ${count} items at ${idx?.updatedAt}`)
}

main().catch(err => {
  console.error('[posts-index] error:', err)
  process.exit(1)
})