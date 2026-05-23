import { getPostsByColumn } from "./post";
import { CHANNELS_CONFIG } from "./channels";
import { validateChannelExists, validateColumnExists } from "./config-validator";
import {
  generateEnhancedMetadata,
  generateColumnStructuredData,
  generateArticleStructuredData,
} from "./seo-utils";
import type { Post, ChannelConfig, ColumnConfig } from "@/types";

export function generateColumnStaticParams(channelKey: string) {
  const channelConfig = CHANNELS_CONFIG[channelKey as keyof typeof CHANNELS_CONFIG];
  if (!channelConfig) return [];
  return Object.keys(channelConfig.columns).map((columnKey) => ({
    columnSlug: columnKey,
  }));
}

export function generatePostStaticParams(channelKey: string) {
  const channelConfig = CHANNELS_CONFIG[channelKey as keyof typeof CHANNELS_CONFIG];
  if (!channelConfig) return [];
  if (process.env.NODE_ENV === "development") return [];

  const params: Array<{ columnSlug: string; postSlug: string }> = [];
  for (const columnKey of Object.keys(channelConfig.columns)) {
    const posts = getPostsByColumn(channelKey, columnKey);
    for (const post of posts) {
      params.push({ columnSlug: columnKey, postSlug: post.slug });
    }
  }
  return params;
}

export function generateColumnMetadata(
  channelKey: string,
  columnSlug: string,
  posts: Post[] = []
) {
  const channelConfig = CHANNELS_CONFIG[channelKey as keyof typeof CHANNELS_CONFIG];
  const columnConfig = channelConfig?.columns?.[columnSlug];
  if (!columnConfig) {
    return { title: "专栏未找到 | 阿松的个人网站" };
  }
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog/${channelKey}/${columnSlug}`;
  const tags = [channelConfig.name, columnConfig.name, "博客", "文章"];
  return generateEnhancedMetadata({
    title: `${columnConfig.name} | ${channelConfig.name} | 阿松的个人网站`,
    description: columnConfig.description,
    url,
    tags,
    section: channelConfig.name,
    type: "website",
  });
}

export function generatePostMetadata(
  post: Post | null,
  channelKey?: string,
  columnSlug?: string
) {
  if (!post) {
    return { title: "文章未找到 | 阿松的个人网站" };
  }
  const channelConfig = channelKey
    ? CHANNELS_CONFIG[channelKey as keyof typeof CHANNELS_CONFIG]
    : null;
  const columnConfig = channelConfig?.columns?.[columnSlug || ""];
  const title = post.title;
  const excerpt = post.excerpt || title;
  const coverImage = post.coverImage;
  const date = post.date;
  const author = post.author;
  const tagsArr = post.tags || [];
  const url =
    channelKey && columnSlug
      ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog/${channelKey}/${columnSlug}/${post.slug}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/posts/${post.slug}`;
  const tags = [
    ...(tagsArr || []),
    ...(channelConfig ? [channelConfig.name] : []),
    ...(columnConfig ? [columnConfig.name] : []),
    "博客",
    "文章",
  ];
  return generateEnhancedMetadata({
    title: `${title} | 阿松的个人网站`,
    description: excerpt,
    url,
    image: coverImage,
    tags,
    section: columnConfig?.name || "博客",
    type: "article",
    publishedTime: date,
    modifiedTime: date,
    authors: author ? [author] : undefined,
  });
}

export function validateChannelColumn(channelKey: string, columnSlug: string) {
  if (!validateChannelExists(CHANNELS_CONFIG, channelKey)) {
    console.warn(`⚠️  Channel '${channelKey}' does not exist`);
    return null;
  }
  if (!validateColumnExists(CHANNELS_CONFIG, channelKey, columnSlug)) {
    console.warn(
      `⚠️  Column '${columnSlug}' does not exist in channel '${channelKey}'`
    );
    return null;
  }
  const channelConfig =
    CHANNELS_CONFIG[channelKey as keyof typeof CHANNELS_CONFIG];
  const columnConfig = channelConfig.columns[columnSlug];
  return { channelConfig, columnConfig };
}
