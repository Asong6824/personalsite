import { unified } from "unified";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";

import {
  isArticleMdxComponentName,
  type ArticleMdxComponentName,
} from "./mdx-component-manifest";

interface MdxAstNode {
  type: string;
  name?: string | null;
  children?: MdxAstNode[];
}

const JSX_NODE_TYPES = new Set(["mdxJsxFlowElement", "mdxJsxTextElement"]);

export interface MdxComponentAnalysis {
  components: ArticleMdxComponentName[];
  unknownComponents: string[];
}

export function analyzeMdxComponents(source: string): MdxComponentAnalysis {
  const tree = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .parse(source) as MdxAstNode;
  const componentNames = new Set<string>();

  function visit(node: MdxAstNode) {
    if (
      JSX_NODE_TYPES.has(node.type) &&
      node.name &&
      /^[A-Z]/.test(node.name)
    ) {
      componentNames.add(node.name);
    }

    node.children?.forEach(visit);
  }

  visit(tree);

  const names = Array.from(componentNames).sort();
  return {
    components: names.filter(isArticleMdxComponentName),
    unknownComponents: names.filter((name) => !isArticleMdxComponentName(name)),
  };
}
