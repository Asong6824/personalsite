"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";

const flowVert = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const flowFrag = `
precision highp float;

uniform float uProgress;
uniform float uGlobalScroll;
uniform float uTime;
uniform vec3 uColorTop;
uniform vec3 uColorBottom;

varying vec2 vUv;

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

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Convert from sRGB to Linear logic to fix muddy transition greys
vec3 sRGBToLinear(vec3 color) {
    return pow(color, vec3(2.2));
}
vec3 linearTosRGB(vec3 color) {
    return pow(color, vec3(1.0/2.2));
}

void main() {
    if (uProgress < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec2 uv = vUv;
    
    // Animate flow strongly based on the USER'S Global Scroll progress, plus a slow idle breath
    float t = uTime * 0.15 + uGlobalScroll * 15.0;

    // Rich liquid waves
    float n1 = snoise(uv * 2.0 + vec2(t * 0.06, t * 0.05));
    float n2 = snoise(uv * 4.0 + vec2(-t * 0.04, t * 0.07));
    
    float flowMix = n1 * 0.6 + n2 * 0.4;
    
    // Stretch out the gradient band and shift it with the noise distortion
    float gradientPos = smoothstep(-0.2, 1.2, (uv.x + uv.y) * 0.5 + flowMix * 0.5);
    
    // Mix linearly to prevent "dirty" and "muddy" greys
    vec3 linearBottom = sRGBToLinear(uColorBottom);
    vec3 linearTop = sRGBToLinear(uColorTop);
    
    vec3 color = mix(linearBottom, linearTop, gradientPos);
    
    // Back to vibrant screen space
    color = linearTosRGB(color);
    
    // Provide a glass-like sheer brightness boost
    color += vec3(0.04, 0.05, 0.06);

    // Apply frosted grain relative to purely hardware fragments, bypassing plane scaling
    // This absolutely fixes horizontal lines/stretching
    float n = random(gl_FragCoord.xy * 0.05 + uTime);
    color += (n - 0.5) * 0.06;

    float alpha = smoothstep(0.0, 0.35, uProgress);
    gl_FragColor = vec4(color, alpha);
}
`;

const FlowBackground = ({ uProgress, scrollYProgress }) => {
    const materialRef = useRef<any>(null);
    const [hasWebGL, setHasWebGL] = useState(true);

    const uniforms = useMemo(
        () => ({
            uProgress: { value: 0 },
            uGlobalScroll: { value: 0 },
            uTime: { value: 0 },
            uColorTop: { value: new THREE.Color("#4AA9FF") }, // More vibrant Sky Blue to defeat greys
            uColorBottom: { value: new THREE.Color("#FFD580") }, // More vibrant Peach
        }),
        []
    );

    useEffect(() => {
        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            setHasWebGL(!!gl);
        } catch {
            setHasWebGL(false);
        }
    }, []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uProgress.value = typeof uProgress.get === 'function' ? uProgress.get() : uProgress;
            materialRef.current.uniforms.uGlobalScroll.value = scrollYProgress && typeof scrollYProgress.get === 'function' ? scrollYProgress.get() : 0;
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    if (!hasWebGL) {
        return (
            <motion.div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(135deg, #FFD580 0%, #4AA9FF 100%)",
                    opacity: uProgress,
                }}
            />
        );
    }

    return (
        <mesh scale={[200, 200, 1]}>
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
