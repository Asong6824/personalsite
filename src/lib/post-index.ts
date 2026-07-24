import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { globSync } from "glob";
import { CHANNELS_CONFIG } from "./channels";
import { validateChannelExists, validateColumnExists } from "./config-validator";
import { analyzeMdxComponents } from "./article/mdx-component-analysis";
import type { ArticleMdxComponentName } from "./article/mdx-component-manifest";
import type { Post, PostFrontmatter } from "@/types";

const ROOT = process.cwd();
const POSTS_DIR = process.env.TEST_POSTS_DIR
  ? path.resolve(process.env.TEST_POSTS_DIR)
  : path.join(ROOT, "content", "blog");
const INDEX_DIR = process.env.TEST_INDEX_DIR
  ? path.resolve(process.env.TEST_INDEX_DIR)
  : path.join(ROOT, "src", "data", "posts");
const INDEX_FP = path.join(INDEX_DIR, "index.json");

const POSTS_INDEX_VERSION = 2;

interface IndexItem {
  slug: string;
  rel: string;
  data: PostFrontmatter;
  components: ArticleMdxComponentName[];
}

interface PostsIndex {
  version: number;
  items: IndexItem[];
  updatedAt: string;
}

let _memIndex: PostsIndex | null = null;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getMdFiles(): string[] {
  return globSync("**/*.mdx", { cwd: POSTS_DIR, nodir: true });
}

function buildIndexFromFS(): PostsIndex {
  console.log("[PostIndex] Rebuilding index from FS...");
  const files = getMdFiles();
  const items: IndexItem[] = [];
  const errors: string[] = [];
  for (const rel of files) {
    const fp = path.join(POSTS_DIR, rel);
    try {
      const raw = fs.readFileSync(fp, "utf-8");
      const { data, content } = matter(raw);
      const componentAnalysis = analyzeMdxComponents(content);
      if (componentAnalysis.unknownComponents.length > 0) {
        throw new Error(
          `Unknown MDX components: ${componentAnalysis.unknownComponents.join(", ")}`,
        );
      }
      const pathSlug = rel.replace(/\.mdx?$/, "");
      let slug = pathSlug;
      const fmSlug = (data.slug as string)?.trim();
      if (fmSlug && fmSlug.length > 0) {
        const dir = path.dirname(rel);
        if (/[\\/]/.test(fmSlug) || fmSlug.startsWith(".")) {
          console.warn(
            `[PostIndex] Invalid slug "${fmSlug}" in ${rel}. Using filename instead.`
          );
        } else {
          slug = dir === "." ? fmSlug : `${dir}/${fmSlug}`;
        }
      }
      items.push({
        slug,
        rel,
        data: data as PostFrontmatter,
        components: componentAnalysis.components,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${rel}: ${message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `[PostIndex] Failed to build article index:\n${errors
        .map((error) => `- ${error}`)
        .join("\n")}`,
    );
  }

  items.sort((a, b) => {
    const ap = (a.data?.pinned as boolean) || false;
    const bp = (b.data?.pinned as boolean) || false;
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;
    const ad = new Date((a.data?.date as string) || 0).getTime();
    const bd = new Date((b.data?.date as string) || 0).getTime();
    return bd - ad;
  });

  const index: PostsIndex = {
    version: POSTS_INDEX_VERSION,
    items,
    updatedAt: new Date().toISOString(),
  };
  _memIndex = index;
  return index;
}

export function readPostsIndex(): PostsIndex | null {
  if (_memIndex) return _memIndex;
  ensureDir(INDEX_DIR);
  if (!fs.existsSync(INDEX_FP)) return null;
  try {
    const raw = fs.readFileSync(INDEX_FP, "utf-8");
    _memIndex = JSON.parse(raw) as PostsIndex;
    return _memIndex;
  } catch {
    return null;
  }
}

export function writePostsIndex(index: PostsIndex): PostsIndex {
  ensureDir(INDEX_DIR);
  fs.writeFileSync(INDEX_FP, JSON.stringify(index, null, 2));
  _memIndex = index;
  return index;
}

export function getOrBuildPostsIndex(): PostsIndex {
  let idx = readPostsIndex();
  if (
    !idx ||
    idx.version !== POSTS_INDEX_VERSION ||
    !Array.isArray(idx.items)
  ) {
    return writePostsIndex(buildIndexFromFS());
  }
  if (process.env.NODE_ENV === "production") {
    return idx;
  }

  const fsFiles = getMdFiles();
  const idxRels = new Set(idx.items.map((i) => i.rel));
  const fsFilesSet = new Set(fsFiles);
  const setsMatch =
    fsFiles.length === idx.items.length &&
    fsFiles.every((f) => idxRels.has(f)) &&
    idx.items.every((i) => fsFilesSet.has(i.rel));
  if (!setsMatch) {
    console.log("[PostIndex] File set changed, rebuilding index...");
    return writePostsIndex(buildIndexFromFS());
  }

  if ((process.env.NODE_ENV as string) !== "production") {
    try {
      const idxTime = new Date(idx.updatedAt).getTime();
      let latestMtime = 0;
      for (const rel of fsFiles) {
        const stat = fs.statSync(path.join(POSTS_DIR, rel));
        if (stat.mtimeMs > latestMtime) latestMtime = stat.mtimeMs;
      }
      if (latestMtime > idxTime) {
        console.log("[PostIndex] Content changed, rebuilding index...");
        return writePostsIndex(buildIndexFromFS());
      }
    } catch {
      return writePostsIndex(buildIndexFromFS());
    }
  }

  return idx;
}

export function findPostPathBySlug(slug: string): string | null {
  const idx = getOrBuildPostsIndex();
  const hit = idx?.items?.find((i: IndexItem) => i.slug === slug);
  return hit ? path.join(POSTS_DIR, hit.rel) : null;
}

export function getIndexedPostComponents(
  slug: string,
): ArticleMdxComponentName[] {
  const idx = getOrBuildPostsIndex();
  return idx.items.find((item) => item.slug === slug)?.components ?? [];
}

function toPost(item: IndexItem): Post {
  const channel = item.data.channel;
  const column = item.data.column;

  if (!channel || !validateChannelExists(CHANNELS_CONFIG, channel)) {
    throw new Error(
      `[PostIndex] Post "${item.rel}" has missing or invalid channel: ${channel}`
    );
  }

  if (!column || !validateColumnExists(CHANNELS_CONFIG, channel, column)) {
    throw new Error(
      `[PostIndex] Post "${item.rel}" has missing or invalid column: ${column} (channel: ${channel})`
    );
  }

  return {
    slug: item.slug,
    title: item.data.title,
    date: item.data.date,
    author: item.data.author,
    tags: Array.isArray(item.data.tags) ? item.data.tags : [],
    excerpt: item.data.excerpt,
    coverImage: item.data.coverImage,
    pinned: item.data.pinned ?? false,
    channel,
    column,
    columnSlug: item.data.columnSlug,
    hidden: item.data.hidden,
    rel: item.rel,
  };
}

export function listIndexedPosts(): Post[] {
  const idx = getOrBuildPostsIndex();
  return idx.items.map(toPost);
}

export function listIndexedSlugs(): string[] {
  const idx = getOrBuildPostsIndex();
  return idx.items.map((i: IndexItem) => i.slug);
}
