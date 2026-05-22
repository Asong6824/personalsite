// 参考 Excalidraw 的三档手绘风格预设
export const SKETCHY_PRESETS = {
  architect: {
    roughness: 0,
    bowing: 0,
    strokeWidth: 1,
  },
  artist: {
    roughness: 1,
    bowing: 1,
    strokeWidth: 1.5,
  },
  cartoonist: {
    roughness: 2,
    bowing: 1.5,
    strokeWidth: 2,
  },
};

// 默认使用 Artist 风格 —— 自然的手绘感
export const DEFAULT_OPTIONS = {
  roughness: 1,
  bowing: 1,
  stroke: '#1a1a1a',
  strokeWidth: 1.5,
  fill: 'transparent',
  fillStyle: 'hachure',
  hachureAngle: 45,
  hachureGap: 4,
  fillWeight: 0.5,
  curveStepCount: 9,
  simplification: 0,
};

// hover 时的视觉变化
export const HOVER_OPTIONS = {
  stroke: '#3b82f6',
  strokeWidthMultiplier: 1.5,
};
