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