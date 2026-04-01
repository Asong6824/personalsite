# HeroSection Redesign — Design Specification

## Context

Redesign the homepage HeroSection to match the reference video from heyrobin.ai. The current implementation has a "dirty" color problem caused by blend mode and transparency stacking. The new design should achieve the clean, vibrant, organic flow effect seen in the reference.

**Reference**: X.com post by @heyrobinai — https://x.com/heyrobinai/status/2019329655757791520

---

## Animation Phases

Based on the 8 reference frames:

| Phase | Scroll Progress | Description |
|-------|-----------------|-------------|
| 1 | 0% - 20% | White background, "asong" in dark gray, rotating color wheel "o" at center |
| 2 | 20% - 40% | "asong" text and color wheel scale up together |
| 3 | 40% - 55% | **Critical point** — color wheel rapidly expands, colors burst outward |
| 4 | 55% - 80% | Full-screen flowing gradient background, text turns white, Chinese quote fades in word by word |
| 5 | 80% - 95% | Deep gradient background + white "asong" + full quote visible |
| 6 | 95% - 100% | Quick fade-out to white, transition to ScrollytellingSection |

**Total scroll height**: 500vh (existing)

---

## Design Language

### Color Palette (Reference)

The color wheel "o" uses pure, saturated colors:

- **Blue**: `#4A90D9` (pure sky blue)
- **Orange**: `#FF8C42` (vibrant orange)
- **Yellow**: `#FFD93D` (bright golden yellow)
- **Pink**: `#FF6B9D` (rose pink)

**Critical**: These colors must be pure (high saturation, no muddy mid-tones) and should mix using `screen` or `lighten` blend mode — NOT `soft-light` or `multiply`.

### Typography

- **"asong"**: System font stack (`SF Pro Display`, `-apple-system`, `BlinkMacSystemFont`), bold weight
- **Chinese quote**: `"大成若缺 其用不弊 大盈若冲 其用不穷"` — Medium weight, wide letter-spacing

### Motion Philosophy

- **Organic flow**: Background colors must flow continuously like liquid, not mechanically loop
- **Sharp transition at critical point**: The moment when color wheel expands should feel like an explosion, not a gradual fade
- **Scroll-driven**: All animation phases are driven by scroll progress (0.0 to 1.0)
- **Smooth text transitions**: Chinese words fade in with stagger, not all at once

---

## Technical Architecture

### Technology Stack

- **Three.js + React Three Fiber**: For WebGL shader-based flowing background
- **Canvas**: For color wheel "o" rendering (purer colors than CSS)
- **Framer Motion**: For scroll-driven text animations and phase transitions
- **Existing infrastructure**: Scroll progress via `useScroll`, `useTransform`

### Component Structure

```
HeroSection (container, 500vh)
├── StickyCanvas (fixed viewport overlay)
│   ├── ColorWheelCanvas (Canvas 2D for "o" color wheel)
│   └── FlowBackground (React Three Fiber + custom shader)
├── TextLayer (asong + Chinese quote, Framer Motion)
└── FadeOverlay (white, opacity driven by scroll)
```

### Key Implementation Details

#### 1. Color Wheel "o" (Canvas 2D)

Instead of CSS conic-gradient (which produces muddy colors), render the color wheel using Canvas 2D:

```javascript
// Pure color segments with hard edges (no gradients between segments)
// Rotation: continuous at 60rpm during Phase 1, slows/stops during expansion
// Scale: 1x → 1.4x during Phase 2, then rapid expansion to fill screen
```

**Blend mode**: Colors rendered as pure segments, overlap uses `screen` logic.

#### 2. Flowing Background (WebGL Shader)

Use a custom fragment shader that:
- Receives `uProgress` uniform (0.0 to 1.0)
- At low progress: renders transparent
- At expansion phase: renders full-screen flowing gradient
- Uses Simplex or Perlin noise for organic flow
- Colors blend using `screen` mode equivalent in shader

```glsl
// Pseudo-code for flow effect
vec3 flowingColor = mix(
  vec3(0.29, 0.56, 0.85),  // blue
  vec3(1.0, 0.55, 0.26),    // orange
  noise(uv + time)         // organic mixing
);
```

#### 3. Scroll Phase Mapping

```javascript
const phase1 = useTransform(scrollYProgress, [0, 0.20], [0, 1]);  // text scale
const phase2 = useTransform(scrollYProgress, [0.20, 0.40], [0, 1]); // expansion start
const phase3 = useTransform(scrollYProgress, [0.40, 0.55], [0, 1]); // explosion
const phase4 = useTransform(scrollYProgress, [0.55, 0.80], [0, 1]); // quote reveal
const phase5 = useTransform(scrollYProgress, [0.80, 0.95], [0, 1]); // final state
const fadeOut = useTransform(scrollYProgress, [0.95, 1.0], [0, 1]); // transition
```

#### 4. Text Layer (Framer Motion)

- **"asong" text**: Scale transform linked to phase1, color transition (gray → white) at phase4
- **Chinese quote**: Opacity stagger per character, driven by phase4
- **Color wheel "o" position**: Absolute positioned, transformed with scale

#### 5. Transition to ScrollytellingSection

At `scrollProgress > 0.95`:
- White overlay opacity fades from 0 to 1
- HeroSection content fades out simultaneously
- ScrollytellingSection starts with pure white background

---

## Performance Considerations

1. **Canvas vs WebGL tradeoff**: If WebGL overhead is too high, fallback to multi-layer Canvas with `globalCompositeOperation: 'screen'`
2. **SSR compatibility**: Three.js/WebGL components must be dynamically imported with `ssr: false`
3. **Will-change hints**: Apply to animated elements for GPU acceleration
4. **Debounce scroll**: `useScroll` already provides smoothed progress; no additional debounce needed

---

## Component Inventory

| Component | Type | Description |
|-----------|------|-------------|
| `HeroSection` | Container | 500vh scroll container, sticky inner |
| `ColorWheelCanvas` | Canvas 2D | Pure color wheel "o" with rotation |
| `FlowBackground` | R3F + Shader | WebGL flowing gradient background |
| `AsongText` | Framer Motion | "asong" text with scale/color transitions |
| `ChineseQuote` | Framer Motion | Staggered word fade-in |
| `WhiteFadeOverlay` | Framer Motion | Opacity-driven white overlay for transition |

---

## File Changes

### New Files

- `src/components/features/HeroSection/ColorWheelCanvas.jsx` — Canvas color wheel
- `src/components/features/HeroSection/FlowBackground.jsx` — R3F shader background
- `src/components/features/HeroSection/shaders/flow.vert` — Vertex shader
- `src/components/features/HeroSection/shaders/flow.frag` — Fragment shader
- `src/shaders/noise.glsl` — Noise functions for organic flow

### Modified Files

- `src/components/features/HeroSection.jsx` — Refactor to use new components

---

## Open Questions / Pending Decisions

1. **Color exact values**: Reference screenshot colors need precise hex extraction — need to verify against actual video
2. **Expansion timing**: "Critical point" at 40% is an estimate — may need tweaking
3. **Flow speed**: Continuous animation speed of flowing background needs iteration
4. **Chinese quote content**: Confirmed as "大成若缺 其用不弊 大盈若冲 其用不穷" — no changes

---

## Success Criteria

1. Colors are pure and vibrant (no muddy brown/gray mid-tones)
2. Background flow feels organic, like liquid or aurora — not mechanical loops
3. Smooth transition at critical expansion point
4. Seamless fade-out transition to ScrollytellingSection
5. Maintains 60fps on modern devices
6. Graceful degradation on lower-end devices (fallback to CSS if WebGL fails)
