import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrismPlus from "rehype-prism-plus";

export const articleMdxOptions: any = {
  // Article MDX is trusted, version-controlled source. Component props rely on
  // JavaScript expressions, while dangerous globals remain blocked by v6.
  blockJS: false,
  blockDangerousJS: true,
  mdxOptions: {
    remarkPlugins: [[remarkGfm, { breaks: true }]],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: [
              "anchor-link",
              "opacity-0",
              "group-hover:opacity-100",
              "transition-opacity",
              "duration-200",
            ],
          },
          content: {
            type: "element",
            tagName: "span",
            properties: { className: ["inline-block", "ml-2", "text-neutral-500"] },
            children: [{ type: "text", value: "#" }],
          },
        },
      ],
      [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
    ],
  },
};
