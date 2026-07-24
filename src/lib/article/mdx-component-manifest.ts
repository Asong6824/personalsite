export const ARTICLE_MDX_COMPONENT_NAMES = [
  "InlineExplanation",
  "BentoGrid",
  "BentoGridItem",
  "BeforeAfter",
  "Highlighter",
  "HSBSliders",
  "ColorWheelSteps",
  "RotatableColorWheel",
  "DualTimeline",
  "RAGFlowDiagram",
  "RAGSidesOverview",
  "SketchyRAGOverview",
  "Word2VecVectorSpace",
  "InContextLearningChart",
  "SketchySvg",
  "SketchyLine",
  "SketchyArrow",
  "SketchyRect",
  "SketchyCircle",
  "SketchyEllipse",
  "SketchyPath",
  "SketchyDashedLine",
  "SketchyText",
  "TravelRouteMap",
  "CityWalkMap",
  "FunctionCallingSteps",
  "MarketStudy",
] as const;

export type ArticleMdxComponentName =
  (typeof ARTICLE_MDX_COMPONENT_NAMES)[number];

const ARTICLE_MDX_COMPONENT_NAME_SET = new Set<string>(
  ARTICLE_MDX_COMPONENT_NAMES,
);

export function isArticleMdxComponentName(
  name: string,
): name is ArticleMdxComponentName {
  return ARTICLE_MDX_COMPONENT_NAME_SET.has(name);
}
