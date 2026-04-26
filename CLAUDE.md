# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog/site built with **Next.js 15 (App Router)**. Content is authored in **MDX** files and rendered server-side. The site features multiple content channels (tech, create, life, finance) with column-based organization, plus integrated stock market data visualization.

## Common Commands

```bash
npm run dev      # Start development server (runs build-posts-index.mjs first)
npm run build    # Production build (runs build-posts-index.mjs first)
npm run start    # Start production server
npm run lint     # Run ESLint
npm run ingest:stocks  # Ingest stock data via script
```

## Architecture

### Content System
- **MDX files** live in `content/blog/` organized by channel/column (e.g., `content/blog/life/japan/`, `content/blog/finance/`)
- **Post index** is built at `src/data/posts/index.json` by `scripts/build-posts-index.mjs` (runs automatically on `predev` and `prebuild`)
- Core post utilities in `src/lib/post.js` and `src/lib/post-index.js` — the latter handles FS-based index building/sorting (pinned first, then by date)
- Slugs preserve directory structure: `life/japan/japan-gion` maps to `content/blog/life/japan/japan-gion.mdx`

### Routing
- Blog posts: `src/app/blog/[...slug]/page.jsx` — catches all slugs
- Channel pages: `src/app/blog/{channel}/page.jsx` and `src/app/blog/{channel}/{columnSlug}/page.jsx`
- API routes under `src/app/api/` for stocks, datasets, and Notion integration

### Channel/Column Config
`src/lib/channels.js` defines `CHANNELS_CONFIG` — four channels (tech, create, life, finance) each with columns. Posts are categorized by tags or explicit `channel`/`column` frontmatter fields.

### Component Architecture
- `src/components/features/` — Page-level section components (HeroSection, BlogAggregatedView, etc.)
- `src/components/ui/` — Reusable UI primitives (bento-grid, timeline, MusicPlayer, TableOfContents)
- `src/components/mdx/` — Components usable directly in MDX (ColorWheelSteps, HSBSliders)
- `src/components/finance/` — Finance-specific components (TempoHero, TempoGrid, DataWall)

### Styling
- **Tailwind CSS v4** with `@tailwindcss/typography` for prose styling
- Dark mode via `next-themes` (ThemeProvider in layout)
- Custom prose styles per channel — tech channel uses warm earth tones, others use default blue

### Stock Data System
`src/lib/stocks/` has a multi-provider architecture:
- `fetch.js` — Entry point, routes to providers, handles caching/fallback
- `providers/alpha.js` — Alpha Vantage (requires `ALPHA_VANTAGE_API_KEY`)
- `providers/yahoo.js` — Yahoo Finance (requires `RAPIDAPI_KEY`)
- `providers/mock.js` — Fallback mock data
- Automatically falls back to mock if API keys are missing

### MDX Rendering
`next-mdx-remote/rsc` renders MDX with custom components passed via `components` prop. Common custom components: `InlineExplanation`, `BentoGrid`, `BeforeAfter`, `Highlighter`, color tools (`HSBSliders`, `ColorWheelSteps`).

### Blog Post Frontmatter
```yaml
---
title: string
date: string (YYYY-MM-DD)
author: string
tags: string[]
excerpt: string
coverImage: string
pinned: boolean  # Optional, pins post to top of lists
channel: string  # Optional, explicit channel assignment
column: string   # Optional, explicit column assignment
music: string | string[]  # Optional, audio URLs for MusicPlayer
hidden: boolean  # Hides from index
---
```

## Key Files

- `src/lib/channels.js` — Channel/column definitions and tag-based categorization
- `src/lib/post-index.js` — Post index building and slug resolution
- `src/lib/post.js` — Post data access with caching wrapper
- `src/app/blog/[...slug]/page.jsx` — Dynamic blog post renderer
- `src/app/blog/page.jsx` — Blog index with pinned posts support
- `scripts/build-posts-index.mjs` — Index build script
