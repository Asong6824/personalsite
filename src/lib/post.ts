import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { withCache } from "./cache";
import {
  listIndexedPosts,
  listIndexedSlugs,
  findPostPathBySlug,
  getOrBuildPostsIndex,
} from "./post-index";

import type { Post, PostFrontmatter } from "@/types";

function _getSortedPostsData(): Post[] {
  return listIndexedPosts().filter((post) => !post.hidden);
}

const isDev = process.env.NODE_ENV === "development";

export const getSortedPostsData = isDev
  ? _getSortedPostsData
  : withCache(_getSortedPostsData, "sorted-posts-data", 10 * 60 * 1000);

export function getAllPostSlugs(): Array<{ slug: string[] }> {
  const slugs = listIndexedSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

interface PostData {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

function _getPostData(slug: string): PostData | null {
  let fullPath = findPostPathBySlug(slug);
  if (!fullPath) {
    getOrBuildPostsIndex();
    fullPath = findPostPathBySlug(slug);
    if (!fullPath) {
      return null;
    }
  }
  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    if (data.hidden) {
      return null;
    }
    return { slug, frontmatter: data as PostFrontmatter, content };
  } catch (error) {
    console.error(
      `Error reading or parsing post with slug "${slug}":`,
      error
    );
    return null;
  }
}

export const getPostData = isDev
  ? _getPostData
  : withCache(_getPostData, "post-data", 15 * 60 * 1000);

function _getPostSummary(slug: string) {
  const idx = getOrBuildPostsIndex();
  const hit = idx.items.find((i) => i.slug === slug);
  if (!hit) return null;
  return { slug: hit.slug, ...hit.data };
}

export const getPostSummary = isDev
  ? _getPostSummary
  : withCache(_getPostSummary, "post-summary", 10 * 60 * 1000);

function _getPostsByChannel(channelKey: string): Post[] {
  const allPosts = getSortedPostsData();
  if (!channelKey) return allPosts;
  return allPosts.filter((post) => post.channel === channelKey);
}

export const getPostsByChannel = isDev
  ? _getPostsByChannel
  : withCache(_getPostsByChannel, "posts-by-channel", 8 * 60 * 1000);

function _getPostsByColumn(
  channelKey: string,
  columnKey: string
): Post[] {
  const allPosts = getSortedPostsData();
  if (!channelKey || !columnKey) return allPosts;
  return allPosts.filter(
    (post) => post.channel === channelKey && post.column === columnKey
  );
}

export const getPostsByColumn = isDev
  ? _getPostsByColumn
  : withCache(_getPostsByColumn, "posts-by-column", 8 * 60 * 1000);

export function getAllUniqueTags(): string[] {
  const allPosts = getSortedPostsData();
  const tagSet = new Set<string>();
  allPosts.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: unknown) => {
        if (tag && typeof tag === "string") {
          tagSet.add(tag.trim());
        }
      });
    }
  });
  return Array.from(tagSet).sort();
}
