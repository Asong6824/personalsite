import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileMDX } from "next-mdx-remote/rsc";
import { describe, expect, it } from "vitest";

import { articleMdxOptions } from "../mdx-options";

describe("article MDX options", () => {
  it("preserves structured component props for trusted repository content", async () => {
    const { content } = await compileMDX({
      source: '<Probe steps={[{ step: 1, title: "Call tool" }]} />',
      options: articleMdxOptions,
      components: {
        Probe: ({ steps }: { steps: Array<{ step: number; title: string }> }) =>
          createElement("span", null, `${steps[0].step}:${steps[0].title}`),
      },
    });

    expect(renderToStaticMarkup(content)).toContain("1:Call tool");
  });

  it("keeps dangerous JavaScript blocking enabled", () => {
    expect(articleMdxOptions.blockJS).toBe(false);
    expect(articleMdxOptions.blockDangerousJS).toBe(true);
  });
});
