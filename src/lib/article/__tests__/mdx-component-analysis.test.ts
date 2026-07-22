import { describe, expect, it } from "vitest";

import { analyzeMdxComponents } from "../mdx-component-analysis";

describe("analyzeMdxComponents", () => {
  it("extracts registered flow and inline components", () => {
    const result = analyzeMdxComponents(`
<FunctionCallingSteps steps={[]} />

Text with <InlineExplanation explanation="Detail">term</InlineExplanation>.
`);

    expect(result).toEqual({
      components: ["FunctionCallingSteps", "InlineExplanation"],
      unknownComponents: [],
    });
  });

  it("ignores component-like text inside code blocks", () => {
    const result = analyzeMdxComponents(`
\`\`\`tsx
<UnknownCodeExample />
\`\`\`
`);

    expect(result).toEqual({ components: [], unknownComponents: [] });
  });

  it("reports unknown components and deduplicates names", () => {
    const result = analyzeMdxComponents(`
<UnknownWidget />
<BeforeAfter before="a" after="b" />
<UnknownWidget />
`);

    expect(result.components).toEqual(["BeforeAfter"]);
    expect(result.unknownComponents).toEqual(["UnknownWidget"]);
  });
});
