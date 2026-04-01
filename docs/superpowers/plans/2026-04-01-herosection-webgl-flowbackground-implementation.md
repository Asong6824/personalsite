# HeroSection WebGL Flow Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After Canvas color wheel expands to fullscreen, render a WebGL-powered flowing gradient background using React Three Fiber + custom fragment shader with Simplex noise. Replaces the CSS DynamicMeshBackground entirely.

**Architecture:** R3F mesh with ShaderMaterial covers the full viewport. Fragment shader uses layered Simplex noise to create organic liquid-like color flow. Uniforms receive scroll progress and time for animation. SSR disabled via dynamic import.

**Tech Stack:** React Three Fiber (`@react-three/fiber`, `@react-three/drei`), Three.js, Framer Motion (scroll), custom GLSL shaders

---

## File Structure

```
src/components/features/HeroSection/
├── ColorWheelCanvas.jsx          # Spec 1 — existing
├── FlowBackground.jsx             # NEW — R3F full-screen shader mesh
├── shaders/
│   ├── flow.vert                 # NEW — vertex shader
│   └── flow.frag                 # NEW — fragment shader with noise
└── HeroSection.jsx               # MODIFY — integrate FlowBackground
```

---

## Task 1: Create flow.vert (Vertex Shader)

**Files:**
- Create: `src/components/features/HeroSection/shaders/flow.vert`

- [ ] **Step 1: Write flow.vert**

```glsl
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/HeroSection/shaders/flow.vert
git commit -m "feat: add flow vertex shader"
```

---

## Task 2: Create flow.frag (Fragment Shader)

**Files:**
- Create: `src/components/features/HeroSection/shaders/flow.frag`

- [ ] **Step 1: Write flow.frag**

```glsl
precision highp float;

uniform float uProgress;
uniform float uTime;
uniform vec3 uColor1; // Blue #4A90D9
uniform vec3 uColor2; // Orange #FF8C42
uniform vec3 uColor3; // Yellow #FFD93D
uniform vec3 uColor4; // Pink #FF6B9D

varying vec2 vUv;

// Simplex noise — Ashima Arts implementation
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    // uProgress 0.0 = transparent, 1.0 = fully visible
    if (uProgress < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec2 uv = vUv;
    float t = uTime;

    // Layer 1: slow base flow
    float n1 = snoise(uv * 2.0 + vec2(t * 0.08, t * 0.06));
    // Layer 2: medium detail
    float n2 = snoise(uv * 3.5 + vec2(-t * 0.11, t * 0.09));
    // Layer 3: fast detail
    float n3 = snoise(uv * 5.0 + vec2(t * 0.07, -t * 0.13));
    // Layer 4: very slow large-scale pattern
    float n4 = snoise(uv * 1.2 + vec2(-t * 0.04, -t * 0.05));

    // Map noise to color mixing
    float mix1 = n1 * 0.5 + 0.5;
    float mix2 = n2 * 0.5 + 0.5;
    float mix3 = n3 * 0.5 + 0.5;
    float mix4 = n4 * 0.5 + 0.5;

    // Two color pair mixes
    vec3 pair1 = mix(uColor1, uColor2, mix1);
    vec3 pair2 = mix(uColor3, uColor4, mix2);

    // Blend pairs
    vec3 color = mix(pair1, pair2, mix3 * 0.6 + 0.2);

    // Screen-blend brightness variation (no muddy multiply)
    float brightness = 1.0 + 0.25 * (n4 * 0.5 + 0.5);
    color *= brightness;

    // Fade in with progress — screen-blend style alpha
    float alpha = smoothstep(0.0, 0.35, uProgress);

    gl_FragColor = vec4(color, alpha);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/HeroSection/shaders/flow.frag
git commit -m "feat: add flow fragment shader with Simplex noise"
```

---

## Task 3: Create FlowBackground.jsx

**Files:**
- Create: `src/components/features/HeroSection/FlowBackground.jsx`

- [ ] **Step 1: Write FlowBackground.jsx**

```javascript
"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import flowVert from "./shaders/flow.vert?raw";
import flowFrag from "./shaders/flow.frag?raw";

const FlowBackground = ({ uProgress }) => {
    const meshRef = useRef();
    const materialRef = useRef();

    const uniforms = useMemo(
        () => ({
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color("#4A90D9") },
            uColor2: { value: new THREE.Color("#FF8C42") },
            uColor3: { value: new THREE.Color("#FFD93D") },
            uColor4: { value: new THREE.Color("#FF6B9D") },
        }),
        []
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uProgress.value = uProgress;
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef} scale={[200, 200, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={flowVert}
                fragmentShader={flowFrag}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
};

export default FlowBackground;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/HeroSection/FlowBackground.jsx
git commit -m "feat: add FlowBackground R3F shader component"
```

---

## Task 4: Integrate FlowBackground into HeroSection.jsx

**Files:**
- Modify: `src/components/features/HeroSection.jsx`

- [ ] **Step 1: Add dynamic import for FlowBackground**

After the ColorWheelCanvas import, add:

```javascript
import dynamic from "next/dynamic";

const FlowBackground = dynamic(() => import("./FlowBackground"), {
    ssr: false,
    loading: () => null,
});
```

- [ ] **Step 2: Add scroll transforms for FlowBackground**

Add after existing color wheel transforms:

```javascript
// FlowBackground progress — starts when color wheel expands past 0.42
const flowProgress = useTransform(scrollYProgress, [0.42, 0.60], [0, 1]);
```

- [ ] **Step 3: Add FlowBackground to JSX**

Add inside the sticky div, before the text content (sibling to DynamicMeshBackground's removed location):

```jsx
{/* FlowBackground — R3F shader flowing gradient */}
<FlowBackground uProgress={flowProgress} />
```

- [ ] **Step 4: Add R3F Canvas wrapper**

The sticky div needs to wrap FlowBackground with R3F Canvas. Since HeroSection already uses Framer Motion, the cleanest approach is to add a Canvas overlay:

```jsx
import { Canvas } from "@react-three/fiber";

// Inside the sticky div, replace/add:
<div className="absolute inset-0 z-0">
    <Canvas gl={{ alpha: true, antialias: true }}>
        <FlowBackground uProgress={flowProgress} />
    </Canvas>
</div>
```

- [ ] **Step 5: Add Three.js Canvas import**

Add to HeroSection.jsx imports:

```javascript
import { Canvas } from "@react-three/fiber";
```

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/features/HeroSection.jsx
git commit -m "feat: integrate FlowBackground R3F shader into HeroSection"
```

---

## Task 5: Add WebGL Fallback

**Files:**
- Modify: `src/components/features/HeroSection/FlowBackground.jsx`
- Modify: `src/components/features/HeroSection.jsx`

- [ ] **Step 1: Add WebGL detection to FlowBackground**

Wrap the R3F Canvas with a client-side WebGL availability check:

```javascript
"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
// ...

const FlowBackground = ({ uProgress }) => {
    const [hasWebGL, setHasWebGL] = useState(true);

    useEffect(() => {
        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            setHasWebGL(!!gl);
        } catch {
            setHasWebGL(false);
        }
    }, []);

    if (!hasWebGL) {
        // CSS fallback — pure gradient, no noise
        return (
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(135deg, #4A90D9 0%, #FF8C42 50%, #FFD93D 100%)",
                    opacity: uProgress,
                }}
            />
        );
    }

    // R3F path continues...
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/HeroSection/FlowBackground.jsx
git commit -m "feat: add WebGL fallback to FlowBackground"
```

---

## Task 6: Verify in Browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify**

Open http://localhost:3000:
- Scroll 0-40%: White background, color wheel "o" rotating
- Scroll 40-55%: Color wheel expands to fullscreen
- Scroll 55-80%: Flowing gradient background visible — organic liquid flow, pure colors
- Scroll 80-95%: Deep gradient + white text + Chinese quote visible
- Scroll 95-100%: Fade out to white
- Flow feels organic, like liquid or aurora — not mechanical loops
- 60fps smooth

---

## Implementation Checklist

- [ ] flow.vert created
- [ ] flow.frag created with Simplex noise
- [ ] FlowBackground.jsx created
- [ ] FlowBackground integrated into HeroSection.jsx
- [ ] WebGL fallback implemented
- [ ] Lint passes
- [ ] Browser verification: organic flow visible at scroll 55%+
- [ ] 60fps performance
