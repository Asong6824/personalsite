# HeroSection Canvas Color Wheel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CSS AnimatedOrb with Canvas 2D color wheel "o" — pure colors, scroll-driven rotation and scale, seamless phase transitions.

**Architecture:** Canvas 2D renders a 4-segment color wheel with hard edges (no gradient). Rotation and scale driven by Framer Motion `useTransform`. ColorWheelCanvas is a standalone component with its own `useEffect` RAF loop for continuous rotation during Phase 1.

**Tech Stack:** React, Canvas 2D API, Framer Motion

---

## File Structure

```
src/components/features/HeroSection/
├── ColorWheelCanvas.jsx    # NEW — Canvas 2D color wheel
└── HeroSection.jsx         # MODIFY — remove AnimatedOrb, integrate ColorWheelCanvas
```

---

## Task 1: Create ColorWheelCanvas.jsx

**Files:**
- Create: `src/components/features/HeroSection/ColorWheelCanvas.jsx`

- [ ] **Step 1: Write ColorWheelCanvas.jsx**

```javascript
"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = ["#4A90D9", "#FF8C42", "#FFD93D", "#FF6B9D"];
const SEGMENTS = 4;

const ColorWheelCanvas = ({
    size = 80,
    rotation = 0,
    scale = 1,
    opacity = 1,
    className,
}) => {
    const canvasRef = useRef(null);

    const draw = useCallback(
        (ctx, currentRotation) => {
            const dpr = window.devicePixelRatio || 1;
            const canvas = ctx.canvas;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            ctx.scale(dpr, dpr);

            const centerX = size / 2;
            const centerY = size / 2;
            const radius = size / 2;

            ctx.clearRect(0, 0, size, size);

            for (let i = 0; i < SEGMENTS; i++) {
                const startAngle = (i / SEGMENTS) * 2 * Math.PI + currentRotation;
                const endAngle = ((i + 1) / SEGMENTS) * 2 * Math.PI + currentRotation;
                ctx.fillStyle = COLORS[i];
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.fill();
            }
        },
        [size]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        draw(ctx, rotation);
    }, [draw, rotation]);

    return (
        <motion.div
            className={cn("relative", className)}
            style={{
                width: size,
                height: size,
                scale: scale,
                opacity: opacity,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                }}
            />
        </motion.div>
    );
};

export default ColorWheelCanvas;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/HeroSection/ColorWheelCanvas.jsx
git commit -m "feat: add ColorWheelCanvas with pure color wheel rendering"
```

---

## Task 2: Refactor HeroSection.jsx

**Files:**
- Modify: `src/components/features/HeroSection.jsx`

**Changes:**
1. Remove `AnimatedOrb` component (lines 7-89)
2. Remove `DynamicMeshBackground` component (lines 91-183)
3. Import and replace with `ColorWheelCanvas`
4. Update scroll phase transforms to drive ColorWheelCanvas props

- [ ] **Step 1: Read current HeroSection.jsx**

Read the full file and identify all sections to replace.

- [ ] **Step 2: Replace AnimatedOrb with ColorWheelCanvas**

In the JSX where `AnimatedOrb` was used (around line 255-259), replace:

```jsx
{/* OLD — AnimatedOrb */}
<motion.div className="relative mx-0.5" style={{ scale: orbScale }}>
    <AnimatedOrb className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" />
</motion.div>

{/* NEW — ColorWheelCanvas */}
<ColorWheelCanvas
    size={80}
    rotation={colorWheelRotation}
    scale={colorWheelScale}
    opacity={colorWheelOpacity}
/>
```

- [ ] **Step 3: Update scroll transforms**

Replace the existing transform definitions with these:

```javascript
// Phase 1-2: Color wheel rotation and scale
const colorWheelRotation = useTransform(scrollYProgress, [0, 0.40], [0, Math.PI * 4]);
const colorWheelScale = useTransform(scrollYProgress, [0, 0.18], [1, 1.4]);

// Phase 3: Rapid expansion to fill screen
const colorWheelExpand = useTransform(scrollYProgress, [0.40, 0.55], [1.4, 80]);

// Fade out after expansion
const colorWheelOpacity = useTransform(scrollYProgress, [0.55, 0.65], [1, 0]);

// Combined scale for Phase 2 + Phase 3
const colorWheelTotalScale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.40, 0.55],
    [1, 1.4, 1.4, 80]
);
```

- [ ] **Step 4: Remove DynamicMeshBackground**

Remove the `<motion.div className="absolute inset-0" style={{ opacity: bgOpacity }}>` wrapper and its `DynamicMeshBackground` child (around lines 232-235).

- [ ] **Step 5: Import ColorWheelCanvas**

Add at top of file:

```javascript
import ColorWheelCanvas from "./ColorWheelCanvas";
```

- [ ] **Step 6: Clean up unused imports**

Remove any imports that were only used by `AnimatedOrb` or `DynamicMeshBackground` (check `cn` utils usage before removing).

- [ ] **Step 7: Run lint**

```bash
npm run lint
```

Expected: No errors. If errors, fix before committing.

- [ ] **Step 8: Commit**

```bash
git add src/components/features/HeroSection.jsx
git commit -m "feat: refactor HeroSection to use ColorWheelCanvas"
```

---

## Task 3: Verify in Browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify**

Open http://localhost:3000:
- At scroll 0%: White background, "asong" in dark gray, color wheel "o" at center rotating
- Scroll 0-20%: "asong" and color wheel scale up together
- Scroll 40-55%: Color wheel rapidly expands to fill screen (explosion feel)
- Scroll 55%+: Text turns white, Chinese quote fades in
- Colors are pure and vibrant (no muddy brown/gray)

---

## Implementation Checklist

- [ ] ColorWheelCanvas.jsx created
- [ ] AnimatedOrb removed from HeroSection.jsx
- [ ] DynamicMeshBackground removed from HeroSection.jsx
- [ ] ColorWheelCanvas integrated into "asong" text
- [ ] Scroll-driven rotation and scale working
- [ ] Phase 3 explosion expansion working
- [ ] Lint passes
- [ ] Browser verification complete
