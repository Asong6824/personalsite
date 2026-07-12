#!/usr/bin/env node
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { globSync } from "glob";
import { CHANNELS_CONFIG } from "../src/lib/channels";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "blog");

type ArticleRecord = {
  rel: string;
  ext: string;
  dir: string;
  expectedDir: string;
  title: string;
  channel: string;
  column: string;
  slug: string;
  url: string;
  bodyKey: string;
};

function normalizeBody(content: string) {
  return content.replace(/\r\n/g, "\n").trim();
}

function getArticleRecords(): ArticleRecord[] {
  return globSync("**/*.{md,mdx}", { cwd: POSTS_DIR, nodir: true })
    .sort()
    .map((rel) => {
      const fp = path.join(POSTS_DIR, rel);
      const raw = fs.readFileSync(fp, "utf-8");
      const parsed = matter(raw);
      const ext = path.extname(rel);
      const dir = path.dirname(rel) === "." ? "" : path.dirname(rel);
      const channel = String(parsed.data.channel || "");
      const column = String(parsed.data.column || "");
      const expectedDir = channel && column ? `${channel}/${column}` : "";
      const filenameSlug = path.basename(rel, ext);
      const slug = String(parsed.data.slug || filenameSlug).trim();
      const indexedSlug = dir ? `${dir}/${slug}` : slug;

      return {
        rel,
        ext,
        dir,
        expectedDir,
        title: String(parsed.data.title || ""),
        channel,
        column,
        slug,
        url: `/blog/${indexedSlug}`,
        bodyKey: normalizeBody(parsed.content),
      };
    });
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

function formatArticle(article: ArticleRecord) {
  const placement = article.channel && article.column ? `${article.channel}/${article.column}` : "missing";
  return `${article.rel} -> ${article.url} [${placement}]`;
}

function printSection(title: string, lines: string[]) {
  console.log(`\n## ${title}`);
  if (lines.length === 0) {
    console.log("- none");
    return;
  }
  for (const line of lines) console.log(`- ${line}`);
}

function main() {
  const records = getArticleRecords();

  const missingColumnDirectories: string[] = [];
  for (const [channelKey, channelConfig] of Object.entries(CHANNELS_CONFIG)) {
    for (const columnKey of Object.keys(channelConfig.columns)) {
      const columnDir = `${channelKey}/${columnKey}`;
      if (!fs.existsSync(path.join(POSTS_DIR, columnDir))) {
        missingColumnDirectories.push(columnDir);
      }
    }
  }

  const directoryMismatches = records
    .filter((record) => record.ext === ".mdx")
    .filter((record) => record.expectedDir && record.dir !== record.expectedDir)
    .map((record) => `${formatArticle(record)}; expected directory: ${record.expectedDir}`);

  const nonMdxFiles = records
    .filter((record) => record.ext !== ".mdx")
    .map(formatArticle);

  const duplicateBodies = [...groupBy(records, (record) => record.bodyKey).values()]
    .filter((group) => group.length > 1)
    .map((group) => group.map(formatArticle).join(" | "));

  const duplicateTitles = [...groupBy(records, (record) => record.title).values()]
    .filter((group) => group[0]?.title && group.length > 1)
    .map((group) => `${group[0].title}: ${group.map(formatArticle).join(" | ")}`);

  const columnsByName = new Map<string, string[]>();
  for (const [channelKey, channelConfig] of Object.entries(CHANNELS_CONFIG)) {
    for (const [columnKey, columnConfig] of Object.entries(channelConfig.columns)) {
      const group = columnsByName.get(columnConfig.name) || [];
      group.push(`${channelKey}/${columnKey}`);
      columnsByName.set(columnConfig.name, group);
    }
  }
  const duplicateColumnNames = [...columnsByName.entries()]
    .filter(([, columns]) => columns.length > 1)
    .map(([name, columns]) => `${name}: ${columns.join(" | ")}`);

  console.log("# Content Organization Audit");
  console.log(`\nScanned ${records.length} Markdown/MDX files under content/blog.`);
  printSection("Missing Column Directories", missingColumnDirectories);
  printSection("Directory Mismatches", directoryMismatches);
  printSection("Duplicate Article Bodies", duplicateBodies);
  printSection("Duplicate Article Titles", duplicateTitles);
  printSection("Duplicate Column Display Names", duplicateColumnNames);
  printSection("Non-MDX Files Not Indexed By post-index.ts", nonMdxFiles);
}

main();
