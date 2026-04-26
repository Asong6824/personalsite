"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const OrbShaderMaterial = () => {
    const materialRef = useRef();

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColorTop: { value: new THREE.Color("#89CFF0") }, // Light Sky Blue
            uColorBottom: { value: new THREE.Color("#FFE5B4") }, // Peach / Pale Orange
        }),
        []
    );

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        uniform vec3 uColorTop;
        uniform vec3 uColorBottom;

        varying vec2 vUv;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            // Center the UV coordinates (-0.5 to 0.5)
            vec2 c_uv = vUv - 0.5;
            float dist = length(c_uv);

            // Soft anti-aliased edge / Halo (Starts fading at 0.35, completely transparent at 0.5)
            float alpha = 1.0 - smoothstep(0.35, 0.5, dist);

            // Gradient mix based on diagonal (Bottom-left to Top-right)
            float gradientPos = (vUv.x + vUv.y) * 0.5;
            vec3 color = mix(uColorBottom, uColorTop, gradientPos);

            // Frosted glass noise texture
            float n = random(vUv + uTime * 0.05);
            color += (n - 0.5) * 0.08;

            gl_FragColor = vec4(color, alpha);
        }
    `;

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent={true}
            // Additive blending can make it look too bright on white background
            // Normal alpha blending is better here for the frosted opacity feel
            blending={THREE.NormalBlending}
        />
    );
};

const GradientOrbCanvas = ({
    size = 80,
    className,
}) => {
    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
            }}
        >
            <Canvas
                gl={{ antialias: true, alpha: true }}
                camera={{ position: [0, 0, 1] }}
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
            >
                {/* A plane that strictly covers the camera view is perfect for custom uv shaders */}
                <mesh>
                    <planeGeometry args={[2, 2]} />
                    <OrbShaderMaterial />
                </mesh>
            </Canvas>
        </div>
    );
};

export default GradientOrbCanvas;
