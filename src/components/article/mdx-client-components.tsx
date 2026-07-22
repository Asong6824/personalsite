"use client";

import dynamic from "next/dynamic";

export const InlineExplanation = dynamic(() =>
  import("@/components/ui/InlineExplanation").then(
    (module) => module.InlineExplanation,
  ),
);

export const Highlighter = dynamic(() =>
  import("@/components/magicui/highlighter").then(
    (module) => module.Highlighter,
  ),
);

export const HSBSliders = dynamic(() =>
  import("@content/components/color/HSBSliders").then(
    (module) => module.HSBSliders,
  ),
);

export const ColorWheelSteps = dynamic(() =>
  import("@content/components/color/ColorWheelSteps").then(
    (module) => module.ColorWheelSteps,
  ),
);

export const RotatableColorWheel = dynamic(() =>
  import("@content/components/color/RotatableColorWheel").then(
    (module) => module.RotatableColorWheel,
  ),
);

export const DualTimeline = dynamic(() =>
  import("@content/components/rag/DualTimeline").then(
    (module) => module.DualTimeline,
  ),
);

export const RAGFlowDiagram = dynamic(() =>
  import("@content/components/rag/RAGFlowDiagram").then(
    (module) => module.RAGFlowDiagram,
  ),
);

export const RAGSidesOverview = dynamic(() =>
  import("@content/components/rag/RAGSidesOverview").then(
    (module) => module.RAGSidesOverview,
  ),
);

export const SketchyRAGOverview = dynamic(() =>
  import("@content/components/rag/SketchyRAGOverview").then(
    (module) => module.SketchyRAGOverview,
  ),
);

export const Word2VecVectorSpace = dynamic(() =>
  import("@content/components/rag/Word2VecVectorSpace").then(
    (module) => module.Word2VecVectorSpace,
  ),
);

export const InContextLearningChart = dynamic(() =>
  import("@content/components/rag/InContextLearningChart").then(
    (module) => module.InContextLearningChart,
  ),
);

export const SketchySvg = dynamic(() =>
  import("@content/components/sketchy/SketchySvg").then(
    (module) => module.SketchySvg,
  ),
);

export const SketchyLine = dynamic(() =>
  import("@content/components/sketchy/SketchyLine").then(
    (module) => module.SketchyLine,
  ),
);

export const SketchyArrow = dynamic(() =>
  import("@content/components/sketchy/SketchyArrow").then(
    (module) => module.SketchyArrow,
  ),
);

export const SketchyRect = dynamic(() =>
  import("@content/components/sketchy/SketchyRect").then(
    (module) => module.SketchyRect,
  ),
);

export const SketchyCircle = dynamic(() =>
  import("@content/components/sketchy/SketchyCircle").then(
    (module) => module.SketchyCircle,
  ),
);

export const SketchyEllipse = dynamic(() =>
  import("@content/components/sketchy/SketchyEllipse").then(
    (module) => module.SketchyEllipse,
  ),
);

export const SketchyPath = dynamic(() =>
  import("@content/components/sketchy/SketchyPath").then(
    (module) => module.SketchyPath,
  ),
);

export const SketchyDashedLine = dynamic(() =>
  import("@content/components/sketchy/SketchyDashedLine").then(
    (module) => module.SketchyDashedLine,
  ),
);

export const SketchyText = dynamic(() =>
  import("@content/components/sketchy/SketchyText").then(
    (module) => module.SketchyText,
  ),
);

export const TravelRouteMap = dynamic(() =>
  import("@content/components/travel/TravelRouteMap").then(
    (module) => module.default,
  ),
);

export const CityWalkMap = dynamic(() =>
  import("@content/components/travel/CityWalkMap").then(
    (module) => module.default,
  ),
);

export const FunctionCallingSteps = dynamic(() =>
  import("@content/components/agent/FunctionCallingSteps").then(
    (module) => module.FunctionCallingSteps,
  ),
);
