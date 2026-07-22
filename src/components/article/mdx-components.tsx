import type { ComponentType } from "react";

import {
  ARTICLE_MDX_COMPONENT_NAMES,
  type ArticleMdxComponentName,
} from "@/lib/article/mdx-component-manifest";

interface CreateArticleMdxComponentsOptions {
  componentNames: ArticleMdxComponentName[];
  useChannelInkHeadings: boolean;
}

type MdxComponent = ComponentType<any>;
type MdxComponentLoader = () => Promise<MdxComponent>;

const componentLoaders = {
  InlineExplanation: async () =>
    (await import("./mdx-client-components")).InlineExplanation,
  BentoGrid: async () =>
    (await import("@/components/ui/bento-grid")).BentoGrid,
  BentoGridItem: async () =>
    (await import("@/components/ui/bento-grid")).BentoGridItem,
  BeforeAfter: async () =>
    (await import("@/components/ui/BeforeAfter")).BeforeAfter,
  Highlighter: async () =>
    (await import("./mdx-client-components")).Highlighter,
  HSBSliders: async () =>
    (await import("./mdx-client-components")).HSBSliders,
  ColorWheelSteps: async () =>
    (await import("./mdx-client-components")).ColorWheelSteps,
  RotatableColorWheel: async () =>
    (await import("./mdx-client-components")).RotatableColorWheel,
  DualTimeline: async () =>
    (await import("./mdx-client-components")).DualTimeline,
  RAGFlowDiagram: async () =>
    (await import("./mdx-client-components")).RAGFlowDiagram,
  RAGSidesOverview: async () =>
    (await import("./mdx-client-components")).RAGSidesOverview,
  SketchyRAGOverview: async () =>
    (await import("./mdx-client-components")).SketchyRAGOverview,
  Word2VecVectorSpace: async () =>
    (await import("./mdx-client-components")).Word2VecVectorSpace,
  InContextLearningChart: async () =>
    (await import("./mdx-client-components")).InContextLearningChart,
  SketchySvg: async () =>
    (await import("./mdx-client-components")).SketchySvg,
  SketchyLine: async () =>
    (await import("./mdx-client-components")).SketchyLine,
  SketchyArrow: async () =>
    (await import("./mdx-client-components")).SketchyArrow,
  SketchyRect: async () =>
    (await import("./mdx-client-components")).SketchyRect,
  SketchyCircle: async () =>
    (await import("./mdx-client-components")).SketchyCircle,
  SketchyEllipse: async () =>
    (await import("./mdx-client-components")).SketchyEllipse,
  SketchyPath: async () =>
    (await import("./mdx-client-components")).SketchyPath,
  SketchyDashedLine: async () =>
    (await import("./mdx-client-components")).SketchyDashedLine,
  SketchyText: async () =>
    (await import("./mdx-client-components")).SketchyText,
  TravelRouteMap: async () =>
    (await import("./mdx-client-components")).TravelRouteMap,
  CityWalkMap: async () =>
    (await import("./mdx-client-components")).CityWalkMap,
  FunctionCallingSteps: async () =>
    (await import("./mdx-client-components")).FunctionCallingSteps,
} satisfies Record<ArticleMdxComponentName, MdxComponentLoader>;

// Keep the manifest and runtime loaders exhaustive in both directions.
ARTICLE_MDX_COMPONENT_NAMES.forEach((name) => {
  if (!componentLoaders[name]) {
    throw new Error(`Missing MDX component loader: ${name}`);
  }
});

export async function createArticleMdxComponents({
  componentNames,
  useChannelInkHeadings,
}: CreateArticleMdxComponentsOptions) {
  const components: Record<string, MdxComponent> = {
    h2: ({ children, ...props }) => (
      <h2
        className="text-[1.65rem] md:text-[1.85rem] font-bold mt-12 mb-5 leading-snug scroll-mt-28"
        style={useChannelInkHeadings ? { color: "var(--channel-ink)" } : {}}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="text-[1.25rem] md:text-[1.35rem] font-semibold mt-8 mb-3 leading-snug scroll-mt-28"
        style={useChannelInkHeadings ? { color: "var(--channel-ink)" } : {}}
        {...props}
      >
        {children}
      </h3>
    ),
  };

  await Promise.all(
    componentNames.map(async (name) => {
      const Component = await componentLoaders[name]();

      if (name === "Highlighter") {
        components[name] = ({
          children,
          color = "#a18072",
          action = "highlight",
          ...props
        }) => (
          <Component
            color={color}
            action={action}
            isView={true}
            animationDuration={800}
            {...props}
          >
            {children}
          </Component>
        );
        return;
      }

      components[name] = Component;
    }),
  );

  return components;
}
