#!/usr/bin/env node

import {
  CONTENT_GRAPH_RELATIONS,
  CONTENT_GRAPH_TRAILS,
} from "../src/data/content-graph";
import { validateContentGraph } from "../src/lib/content-graph-validation";
import { getOrBuildPostsIndex } from "../src/lib/post-index";

function main() {
  const index = getOrBuildPostsIndex();
  const posts = index.items.map((item) => ({
    slug: item.slug,
    hidden: item.data.hidden,
    nextReads: item.data.nextReads,
  }));
  const result = validateContentGraph(
    CONTENT_GRAPH_TRAILS,
    CONTENT_GRAPH_RELATIONS,
    posts,
  );

  if (result.warnings.length > 0) {
    console.warn("\n[content-graph] validation warnings:");
    for (const warning of result.warnings) {
      console.warn(`  ${warning}`);
    }
  }

  if (result.errors.length > 0) {
    console.error("\n[content-graph] validation errors:");
    for (const error of result.errors) {
      console.error(`  ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `[content-graph] validation passed: ${CONTENT_GRAPH_TRAILS.length} trails, ${CONTENT_GRAPH_RELATIONS.length} relations, ${posts.length} articles.`,
  );
}

try {
  main();
} catch (error) {
  console.error("[content-graph] validation failed:", error);
  process.exit(1);
}
