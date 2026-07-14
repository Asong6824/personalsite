import type { PostFrontmatter } from "@/types";

export type ArticleMediaType = "interactive" | "video" | "image" | null;

export const DEFAULT_ARTICLE_PLAYLIST = [
  {
    title: "轻音乐 - 森林晨曲",
    artist: "自然之声",
    src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  {
    title: "轻音乐 - 海浪声",
    artist: "自然之声",
    src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
];

export function estimateReadingMinutes(content: string): number {
  const compact = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "");

  return Math.max(1, Math.ceil(compact.length / 550));
}

export function getArticleMediaType(slug: string, frontmatter: PostFrontmatter): ArticleMediaType {
  if (slug === "tech/ai-engineering/from-rag-technique-to-rag-philosophy") {
    return "interactive";
  }

  if (frontmatter.heroVideo || frontmatter.videoUrl) {
    return "video";
  }

  if (frontmatter.coverImage) {
    return "image";
  }

  return null;
}

export function getArticleMediaLabel(mediaType: ArticleMediaType): string | null {
  if (mediaType === "interactive") return "交互全文地图";
  if (mediaType === "video") return "视频";
  if (mediaType === "image") return "图片";
  return null;
}

export function getPlaylistFromFrontmatter(frontmatter: PostFrontmatter) {
  if (frontmatter.music) {
    if (Array.isArray(frontmatter.music)) {
      return frontmatter.music.map((url, index) => ({
        title: `背景音乐 ${index + 1}`,
        artist: "博客配乐",
        src: url,
      }));
    }

    return [
      {
        title: "背景音乐 1",
        artist: "博客配乐",
        src: frontmatter.music,
      },
    ];
  }

  return DEFAULT_ARTICLE_PLAYLIST;
}
