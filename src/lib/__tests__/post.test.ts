import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock post-index 模块 — 控制索引数据
const mockIndexItems: Array<{ slug: string; data: Record<string, unknown> }> = [];

vi.mock("../post-index", () => ({
  listIndexedPosts: () => mockIndexItems.map((i) => ({ ...i.data, slug: i.slug })),
  listIndexedSlugs: () => mockIndexItems.map((i) => i.slug),
  findPostPathBySlug: (slug: string) => {
    const hit = mockIndexItems.find((i) => i.slug === slug);
    return hit ? `/mock/content/blog/${hit.data.rel || slug}` : null;
  },
  getOrBuildPostsIndex: () => ({
    items: mockIndexItems,
    updatedAt: new Date().toISOString(),
  }),
}));

// Mock fs
const mockFiles: Record<string, string> = {};

vi.mock("fs", () => ({
  default: {
    readFileSync: (p: string) => {
      if (mockFiles[p]) return mockFiles[p];
      throw new Error(`File not found: ${p}`);
    },
  },
}));

// Mock cache — 开发环境不缓存
vi.mock("../cache", () => ({
  withCache: (fn: Function) => fn,
}));

import {
  getSortedPostsData,
  getAllPostSlugs,
  getPostData,
  getPostSummary,
  getPostsByChannel,
  getPostsByColumn,
  getAllUniqueTags,
} from "../post";

describe("post", () => {
  beforeEach(() => {
    mockIndexItems.length = 0;
    Object.keys(mockFiles).forEach((k) => delete mockFiles[k]);
  });

  describe("getSortedPostsData", () => {
    it("返回所有非隐藏文章", () => {
      mockIndexItems.push(
        { slug: "visible", data: { title: "Visible", date: "2026-01-01", tags: ["Go"], pinned: false, hidden: false } },
        { slug: "hidden-post", data: { title: "Hidden", date: "2026-01-02", tags: ["Go"], pinned: false, hidden: true } },
      );
      const posts = getSortedPostsData();
      expect(posts).toHaveLength(1);
      expect(posts[0].slug).toBe("visible");
    });

    it("无文章返回空数组", () => {
      const posts = getSortedPostsData();
      expect(posts).toEqual([]);
    });

    it("不设置 hidden 字段默认为可见", () => {
      mockIndexItems.push(
        { slug: "no-hidden", data: { title: "No Hidden", date: "2026-01-01", tags: [], pinned: false } },
      );
      const posts = getSortedPostsData();
      expect(posts).toHaveLength(1);
    });
  });

  describe("getAllPostSlugs", () => {
    it("返回 slug 数组格式", () => {
      mockIndexItems.push(
        { slug: "tech/go/article", data: { title: "Article", date: "2026-01-01", tags: [], pinned: false } },
      );
      const slugs = getAllPostSlugs();
      expect(slugs).toHaveLength(1);
      expect(slugs[0]).toEqual({ slug: ["tech", "go", "article"] });
    });

    it("单段 slug 正确分割", () => {
      mockIndexItems.push(
        { slug: "hello", data: { title: "Hello", date: "2026-01-01", tags: [], pinned: false } },
      );
      const slugs = getAllPostSlugs();
      expect(slugs[0]).toEqual({ slug: ["hello"] });
    });
  });

  describe("getPostData", () => {
    it("读取存在的文章", () => {
      mockIndexItems.push(
        { slug: "test-post", data: { title: "Test", date: "2026-01-01", tags: [], pinned: false, rel: "test-post.mdx" } },
      );
      mockFiles["/mock/content/blog/test-post.mdx"] = `---\ntitle: Test\ndate: 2026-01-01\n---\n# Hello\nContent`;

      const post = getPostData("test-post");
      expect(post).not.toBeNull();
      expect(post!.slug).toBe("test-post");
      expect(post!.frontmatter.title).toBe("Test");
      expect(post!.content).toContain("Hello");
    });

    it("找不到文章返回 null", () => {
      const post = getPostData("non-existent");
      expect(post).toBeNull();
    });

    it("隐藏文章返回 null", () => {
      mockIndexItems.push(
        { slug: "hidden-post", data: { title: "Hidden", date: "2026-01-01", tags: [], pinned: false, hidden: true, rel: "hidden.mdx" } },
      );
      mockFiles["/mock/content/blog/hidden.mdx"] = `---\ntitle: Hidden\ndate: 2026-01-01\nhidden: true\n---\nContent`;

      const post = getPostData("hidden-post");
      expect(post).toBeNull();
    });

    it("读取带 frontmatter 的文章", () => {
      mockIndexItems.push(
        { slug: "complex", data: { title: "Complex", date: "2026-01-01", tags: ["Go"], pinned: false, rel: "complex.mdx" } },
      );
      mockFiles["/mock/content/blog/complex.mdx"] = `---\ntitle: Complex\ndate: 2026-01-01\nauthor: Test\ntags:\n  - Go\n  - 技术\nexcerpt: Summary\n---\n# Complex Post\nContent here`;

      const post = getPostData("complex");
      expect(post).not.toBeNull();
      expect(post!.frontmatter.author).toBe("Test");
      expect(post!.frontmatter.excerpt).toBe("Summary");
    });
  });

  describe("getPostSummary", () => {
    it("返回文章摘要", () => {
      mockIndexItems.push(
        { slug: "summary-post", data: { title: "Summary", date: "2026-01-01", tags: ["Go"], pinned: false } },
      );

      const summary = getPostSummary("summary-post");
      expect(summary).not.toBeNull();
      expect(summary!.slug).toBe("summary-post");
      expect(summary!.title).toBe("Summary");
    });

    it("找不到返回 null", () => {
      const summary = getPostSummary("non-existent");
      expect(summary).toBeNull();
    });
  });

  describe("getPostsByChannel", () => {
    it("按 tags 过滤 tech 频道文章", () => {
      mockIndexItems.push(
        { slug: "go-post", data: { title: "Go Post", date: "2026-01-01", tags: ["Go"], pinned: false } },
        { slug: "life-post", data: { title: "Life Post", date: "2026-01-01", tags: ["日本"], pinned: false } },
        { slug: "general-tech", data: { title: "General Tech", date: "2026-01-01", tags: ["技术"], pinned: false } },
      );

      const techPosts = getPostsByChannel("tech");
      expect(techPosts).toHaveLength(2);
      expect(techPosts.some((p) => p.slug === "go-post")).toBe(true);
      expect(techPosts.some((p) => p.slug === "general-tech")).toBe(true);
      expect(techPosts.some((p) => p.slug === "life-post")).toBe(false);
    });

    it("空 channelKey 返回所有文章", () => {
      mockIndexItems.push(
        { slug: "a", data: { title: "A", date: "2026-01-01", tags: ["Go"], pinned: false } },
        { slug: "b", data: { title: "B", date: "2026-01-01", tags: ["日本"], pinned: false } },
      );

      const allPosts = getPostsByChannel("");
      expect(allPosts).toHaveLength(2);
    });

    it("无匹配返回空数组", () => {
      mockIndexItems.push(
        { slug: "only-life", data: { title: "Life", date: "2026-01-01", tags: ["日本"], pinned: false } },
      );

      const techPosts = getPostsByChannel("tech");
      expect(techPosts).toEqual([]);
    });
  });

  describe("getPostsByColumn", () => {
    it("按显式 channel/column 过滤", () => {
      mockIndexItems.push(
        { slug: "go-post", data: { title: "Go Post", date: "2026-01-01", tags: ["Go"], pinned: false, channel: "tech", column: "go" } },
        { slug: "general-post", data: { title: "General Post", date: "2026-01-01", tags: ["技术"], pinned: false, channel: "tech", column: "general" } },
        { slug: "life-post", data: { title: "Life Post", date: "2026-01-01", tags: ["Go"], pinned: false, channel: "life", column: "misc" } },
      );

      const goPosts = getPostsByColumn("tech", "go");
      expect(goPosts).toHaveLength(1);
      expect(goPosts[0].slug).toBe("go-post");
    });

    it("空参数返回所有文章", () => {
      mockIndexItems.push(
        { slug: "a", data: { title: "A", date: "2026-01-01", tags: ["Go"], pinned: false } },
      );

      const allPosts = getPostsByColumn("", "");
      expect(allPosts).toHaveLength(1);
    });
  });

  describe("getAllUniqueTags", () => {
    it("返回所有唯一标签（已排序）", () => {
      mockIndexItems.push(
        { slug: "a", data: { title: "A", date: "2026-01-01", tags: ["Go", "技术"], pinned: false } },
        { slug: "b", data: { title: "B", date: "2026-01-01", tags: ["日本", "Go"], pinned: false } },
      );

      const tags = getAllUniqueTags();
      expect(tags).toContain("Go");
      expect(tags).toContain("日本");
      expect(tags).toContain("技术");
      expect(tags.indexOf("Go")).toBeLessThan(tags.indexOf("日本")); // 排序检查
    });

    it("处理无标签文章", () => {
      mockIndexItems.push(
        { slug: "no-tags", data: { title: "No Tags", date: "2026-01-01", tags: [], pinned: false } },
        { slug: "with-tags", data: { title: "With Tags", date: "2026-01-01", tags: ["Go"], pinned: false } },
      );

      const tags = getAllUniqueTags();
      expect(tags).toEqual(["Go"]);
    });

    it("处理非字符串标签", () => {
      mockIndexItems.push(
        { slug: "mixed", data: { title: "Mixed", date: "2026-01-01", tags: ["Go", 123, null, "技术"], pinned: false } },
      );

      const tags = getAllUniqueTags();
      // 非字符串标签被过滤
      expect(tags).toContain("Go");
      expect(tags).toContain("技术");
    });

    it("空文章列表返回空数组", () => {
      const tags = getAllUniqueTags();
      expect(tags).toEqual([]);
    });
  });
});
