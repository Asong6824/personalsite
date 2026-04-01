"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import flowVert from "./shaders/flow.vert?raw";
import flowFrag from "./shaders/flow.frag?raw";

const FlowBackground = ({ uProgress }) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const [hasWebGL, setHasWebGL] = useState(true);

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
            materialRef.current.uniforms.uProgress.value = uProgress;
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    if (!hasWebGL) {
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