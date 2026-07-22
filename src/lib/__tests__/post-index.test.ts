import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("post-index", () => {
  let testDir: string;
  let postIndex: typeof import("../post-index");

  beforeEach(async () => {
    // 创建临时目录
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "post-test-"));
    process.env.TEST_POSTS_DIR = path.join(testDir, "blog");
    process.env.TEST_INDEX_DIR = path.join(testDir, "data", "posts");
    fs.mkdirSync(process.env.TEST_POSTS_DIR, { recursive: true });

    // 动态导入模块，每次重新初始化 _memIndex
    vi.resetModules();
    postIndex = await import("../post-index");
  });

  afterEach(() => {
    delete process.env.TEST_POSTS_DIR;
    delete process.env.TEST_INDEX_DIR;
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  function writePost(relPath: string, frontmatter: string, content = "Content") {
    const dir = path.dirname(path.join(process.env.TEST_POSTS_DIR!, relPath));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const defaults: string[] = [];
    if (!/(^|\n)channel\s*:/.test(frontmatter)) defaults.push("channel: tech");
    if (!/(^|\n)column\s*:/.test(frontmatter)) defaults.push("column: general");
    const fullFrontmatter = defaults.length > 0 ? `${frontmatter}\n${defaults.join("\n")}` : frontmatter;
    fs.writeFileSync(
      path.join(process.env.TEST_POSTS_DIR!, relPath),
      `---\n${fullFrontmatter}\n---\n${content}`
    );
  }

  describe("索引构建", () => {
    it("从空文件系统构建空索引", () => {
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items).toEqual([]);
    });

    it("构建包含单篇文章的索引", () => {
      writePost(
        "hello.mdx",
        "title: Hello\ndate: 2026-01-01",
        "Content <InlineExplanation explanation=\"Detail\">term</InlineExplanation>",
      );
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items).toHaveLength(1);
      expect(idx.items[0].slug).toBe("hello");
      expect(idx.items[0].rel).toBe("hello.mdx");
      expect(idx.items[0].data.title).toBe("Hello");
      expect(idx.items[0].components).toEqual(["InlineExplanation"]);
    });

    it("未知 MDX 组件会阻止索引构建", () => {
      writePost(
        "unknown.mdx",
        "title: Unknown\ndate: 2026-01-01",
        "<UnknownWidget />",
      );

      expect(() => postIndex.getOrBuildPostsIndex()).toThrow(
        /Unknown MDX components: UnknownWidget/,
      );
    });

    it("默认使用文件路径作为 slug", () => {
      writePost("tech/general/go-tips.mdx", "title: Go Tips\ndate: 2026-01-01");
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items[0].slug).toBe("tech/general/go-tips");
    });

    it("frontmatter slug 覆盖文件名部分", () => {
      writePost("tech/general/post.mdx", "title: Post\ndate: 2026-01-01\nslug: custom-name");
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items[0].slug).toBe("tech/general/custom-name");
    });

    it("非法 frontmatter slug 被忽略", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      writePost("test.mdx", 'title: Test\ndate: 2026-01-01\nslug: "invalid/slug"');
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items[0].slug).toBe("test"); // 使用文件名
      warnSpy.mockRestore();
    });

    it("以点开头的 slug 被忽略", () => {
      writePost("test.mdx", 'title: Test\ndate: 2026-01-01\nslug: ".hidden"');
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items[0].slug).toBe("test");
    });
  });

  describe("排序逻辑", () => {
    it("置顶文章排在最前", () => {
      writePost("b.mdx", "title: B\ndate: 2026-01-02");
      writePost("a.mdx", "title: A\ndate: 2026-01-01\npinned: true");
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items[0].slug).toBe("a");
      expect(idx.items[1].slug).toBe("b");
    });

    it("非置顶文章按日期降序排列", () => {
      writePost("old.mdx", "title: Old\ndate: 2025-01-01");
      writePost("new.mdx", "title: New\ndate: 2026-01-01");
      const idx = postIndex.getOrBuildPostsIndex();
      expect(idx.items[0].slug).toBe("new");
      expect(idx.items[1].slug).toBe("old");
    });
  });

  describe("索引读写", () => {
    it("索引写入后可以被读取", () => {
      const testIndex = {
        version: 2,
        items: [{ slug: "test", rel: "test.mdx", data: { title: "Test", date: "2026-01-01" }, components: [] }],
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      postIndex.writePostsIndex(testIndex);
      const read = postIndex.readPostsIndex();
      expect(read).toEqual(testIndex);
    });

    it("读取不存在的索引返回 null", async () => {
      // 确保索引文件不存在
      const indexPath = path.join(testDir, "src", "data", "posts", "index.json");
      if (fs.existsSync(indexPath)) fs.unlinkSync(indexPath);
      // 重新导入模块以重置 _memIndex
      vi.resetModules();
      const freshMod = await import("../post-index");
      const result = freshMod.readPostsIndex();
      expect(result).toBeNull();
    });
  });

  describe("工具函数", () => {
    it("findPostPathBySlug 返回正确路径", () => {
      writePost("tech/go/article.mdx", "title: Article\ndate: 2026-01-01");
      postIndex.getOrBuildPostsIndex();
      const foundPath = postIndex.findPostPathBySlug("tech/go/article");
      expect(foundPath).toContain("tech/go/article.mdx");
    });

    it("findPostPathBySlug 找不到返回 null", () => {
      const foundPath = postIndex.findPostPathBySlug("non-existent");
      expect(foundPath).toBeNull();
    });

    it("listIndexedSlugs 返回所有 slug", () => {
      writePost("a.mdx", "title: A\ndate: 2026-01-01");
      writePost("b.mdx", "title: B\ndate: 2026-01-02");
      const slugs = postIndex.listIndexedSlugs();
      expect(slugs).toContain("a");
      expect(slugs).toContain("b");
    });

    it("listIndexedPosts 返回带 slug 的数据", () => {
      writePost("test.mdx", "title: Test\ndate: 2026-01-01\nauthor: TestAuthor");
      const posts = postIndex.listIndexedPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].slug).toBe("test");
      expect(posts[0].title).toBe("Test");
      expect(posts[0].author).toBe("TestAuthor");
    });
  });

  describe("增量检测", () => {
    it("文件新增触发重建", () => {
      writePost("first.mdx", "title: First\ndate: 2026-01-01");
      const idx1 = postIndex.getOrBuildPostsIndex();
      expect(idx1.items).toHaveLength(1);

      // 模拟模块重新加载以清空 _memIndex
      vi.resetModules();

      writePost("second.mdx", "title: Second\ndate: 2026-01-02");
      const idx2 = postIndex.getOrBuildPostsIndex();
      expect(idx2.items).toHaveLength(2);
    });
  });
});
