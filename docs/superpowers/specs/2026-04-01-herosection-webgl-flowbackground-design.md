# HeroSection — WebGL Flow Background 实现规格

## 上下文

承接 [Spec 1: Canvas Color Wheel](./2026-04-01-herosection-colorwheel-canvas-design.md)，在 ColorWheelCanvas 膨胀至全屏后，FlowBackground 接续渲染 WebGL 流光渐变背景。

**目标**：实现有机流动的液态背景效果（类似极光/流体），颜色使用 ColorWheel 的四种纯色，通过 Simplex/Perlin 噪声驱动有机流动。

---

## 设计语言

### 基础色

| 名称 | Hex |
|------|-----|
| Blue | `#4A90D9` |
| Orange | `#FF8C42` |
| Yellow | `#FFD93D` |
| Pink | `#FF6B9D` |

### 流动效果

- **有机流动**：背景颜色像液体一样持续流动，不是机械的循环
- **混合模式**：`screen` 等效（颜色叠加而非相乘，无浑浊）
- **噪声驱动**：使用 Simplex noise 或 Perlin noise 驱动颜色混合

---

## 技术方案

### 组件结构

```
HeroSection/
├── ColorWheelCanvas.jsx   # Spec 1
├── FlowBackground.jsx     # React Three Fiber 流动背景
├── shaders/
│   ├── flow.vert          # 顶点着色器（全屏四边形）
│   └── flow.frag          # 片段着色器（噪声 + 颜色混合）
└── noise.glsl             # Simplex noise 实现
```

### FlowBackground 实现

**文件**: `src/components/features/HeroSection/FlowBackground.jsx`

使用 React Three Fiber + 自定义 ShaderMaterial：

```javascript
const FlowBackground = ({ uProgress, uTime }) => {
    const meshRef = useRef();
    const { viewport } = useThree();

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                uniforms={{
                    uProgress: { value: uProgress },
                    uTime: { value: uTime },
                    uColor1: { value: new THREE.Color('#4A90D9') },
                    uColor2: { value: new THREE.Color('#FF8C42') },
                    uColor3: { value: new THREE.Color('#FFD93D') },
                    uColor4: { value: new THREE.Color('#FF6B9D') },
                }}
                vertexShader={flowVert}
                fragmentShader={flowFrag}
            />
        </mesh>
    );
};
```

### 顶点着色器 (flow.vert)

简单的全屏四边形顶点传递：

```glsl
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

### 片段着色器 (flow.frag)

核心效果：噪声驱动的颜色有机混合。

```glsl
precision highp float;
uniform float uProgress;
uniform float uTime;
uniform vec3 uColor1;  // Blue #4A90D9
uniform vec3 uColor2;  // Orange #FF8C42
uniform vec3 uColor3;  // Yellow #FFD93D
uniform vec3 uColor4;  // Pink #FF6B9D
varying vec2 vUv;

// Simplex noise function
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

// Organic flow mixing using noise
vec3 getFlowColor(vec2 uv, float time) {
    float n1 = snoise(uv * 2.0 + time * 0.1);
    float n2 = snoise(uv * 3.0 - time * 0.15);
    float n3 = snoise(uv * 1.5 + time * 0.08);
    float n4 = snoise(uv * 4.0 - time * 0.12);

    vec3 c1 = mix(uColor1, uColor2, n1 * 0.5 + 0.5);
    vec3 c2 = mix(uColor3, uColor4, n2 * 0.5 + 0.5);
    vec3 c3 = mix(c1, c2, n3 * 0.5 + 0.5);

    return mix(c3, uColor1, n4 * 0.3 + 0.2);
}

void main() {
    // uProgress: 0.0 = transparent, 1.0 = fully visible
    // At low progress, render transparent
    if (uProgress < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec2 uv = vUv;
    float time = uTime;

    // Multiple layers of flowing noise
    vec3 color = getFlowColor(uv, time);

    // Screen blend equivalent: brightening
    float brightness = 1.0 + 0.2 * snoise(uv * 5.0 + time * 0.2);
    color *= brightness;

    // Fade in with progress
    float alpha = smoothstep(0.0, 0.3, uProgress);

    gl_FragColor = vec4(color, alpha);
}
```

### Scroll Phase Mapping

```javascript
// HeroSection.jsx 中的 scroll mapping
const flowProgress = useTransform(scrollYProgress, [0.42, 0.60], [0, 1]);
const flowOpacity = useTransform(scrollYProgress, [0.42, 0.60], [0, 1]);

// FlowBackground 使用 uProgress 控制显示/隐藏
// ColorWheelCanvas 在 phase 3 膨胀后 uProgress > 0.55 时淡出
```

### SSR 兼容

```javascript
// FlowBackground 必须在客户端渲染
const FlowBackground = dynamic(() => import('./FlowBackground'), { ssr: false });
```

---

## 文件变更

### 新建

- `src/components/features/HeroSection/FlowBackground.jsx`
- `src/components/features/HeroSection/shaders/flow.vert`
- `src/components/features/HeroSection/shaders/flow.frag`
- `src/shaders/noise.glsl`（或内联到 frag shader）

### 修改

- `src/components/features/HeroSection.jsx` — 集成 FlowBackground

---

## 成功标准

1. 背景流动感觉有机，像液体或极光——不是机械循环
2. 颜色纯净明亮，无浑浊中间色
3. 与 ColorWheelCanvas 膨胀无缝衔接
4. 60fps 流畅
5. WebGL 不可用时优雅降级（纯色渐变 fallback）
