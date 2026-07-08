import { InlineExplanation } from "@/components/ui/InlineExplanation";
import { Highlighter } from "@/components/magicui/highlighter";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { HSBSliders } from "@content/components/color/HSBSliders";
import { ColorWheelSteps } from "@content/components/color/ColorWheelSteps";
import { RotatableColorWheel } from "@content/components/color/RotatableColorWheel";
import { DualTimeline } from "@content/components/rag/DualTimeline";
import { RAGFlowDiagram } from "@content/components/rag/RAGFlowDiagram";
import { RAGSidesOverview } from "@content/components/rag/RAGSidesOverview";
import { SketchyRAGOverview } from "@content/components/rag/SketchyRAGOverview";
import { Word2VecVectorSpace } from "@content/components/rag/Word2VecVectorSpace";
import { InContextLearningChart } from "@content/components/rag/InContextLearningChart";
import {
  SketchySvg,
  SketchyLine,
  SketchyArrow,
  SketchyRect,
  SketchyCircle,
  SketchyEllipse,
  SketchyPath,
  SketchyDashedLine,
  SketchyText,
} from "@content/components/sketchy";
import { TravelRouteMap, CityWalkMap } from "@content/components/travel";
import { FunctionCallingSteps } from "@content/components/agent/FunctionCallingSteps";

interface CreateArticleMdxComponentsOptions {
  useChannelInkHeadings: boolean;
}

export function createArticleMdxComponents({
  useChannelInkHeadings,
}: CreateArticleMdxComponentsOptions) {
  return {
    InlineExplanation,
    BentoGrid,
    BentoGridItem,
    BeforeAfter,
    HSBSliders,
    ColorWheelSteps,
    RotatableColorWheel,
    DualTimeline,
    RAGFlowDiagram,
    RAGSidesOverview,
    SketchyRAGOverview,
    Word2VecVectorSpace,
    InContextLearningChart,
    SketchySvg,
    SketchyLine,
    SketchyArrow,
    SketchyRect,
    SketchyCircle,
    SketchyEllipse,
    SketchyPath,
    SketchyDashedLine,
    SketchyText,
    TravelRouteMap,
    CityWalkMap,
    FunctionCallingSteps,
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
    Highlighter: ({
      children,
      color = "#a18072",
      action = "highlight",
      ...props
    }) => (
      <Highlighter
        color={color}
        action={action}
        isView={true}
        animationDuration={800}
        {...props}
      >
        {children}
      </Highlighter>
    ),
  };
}

export { SketchyRAGOverview };
