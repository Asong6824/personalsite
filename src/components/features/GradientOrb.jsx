// src/components/features/GradientOrb.jsx
"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Custom shader for the glowing orb effect
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uRotation;
  
  void main() {
    // Calculate fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
    
    // Animated gradient based on position and time
    float angle = atan(vPosition.y, vPosition.x) + uRotation;
    float gradient = (sin(angle * 2.0 + uTime * 0.5) + 1.0) * 0.5;
    
    // Color palette: soft blue to peach/orange
    vec3 color1 = vec3(0.53, 0.81, 0.98); // Light sky blue
    vec3 color2 = vec3(0.29, 0.56, 0.85); // Deeper blue  
    vec3 color3 = vec3(0.96, 0.80, 0.69); // Peach
    vec3 color4 = vec3(0.98, 0.70, 0.53); // Soft orange
    
    // Mix colors based on vertical position and gradient
    float yFactor = (vPosition.y + 1.0) * 0.5;
    vec3 topColor = mix(color1, color2, gradient);
    vec3 bottomColor = mix(color3, color4, gradient);
    vec3 baseColor = mix(bottomColor, topColor, yFactor);
    
    // Add subtle inner glow
    float innerGlow = smoothstep(0.0, 0.7, 1.0 - fresnel);
    vec3 glowColor = mix(baseColor, vec3(1.0), innerGlow * 0.15);
    
    // Edge highlight
    vec3 finalColor = mix(glowColor, vec3(1.0), fresnel * 0.3);
    
    // Soft alpha for glass-like effect
    float alpha = 0.92 + fresnel * 0.08;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// The 3D Orb component
function Orb({ rotation = 0, scale = 1 }) {
    const meshRef = useRef();
    const materialRef = useRef();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uRotation: { value: 0 },
        }),
        []
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uRotation.value = rotation * (Math.PI / 180);
        }
    });

    return (
        <mesh ref={meshRef} scale={scale}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// Wrapper component with Canvas
export default function GradientOrb({ rotation = 0, scale = 1, className = "" }) {
    return (
        <div className={`${className}`} style={{ width: "100%", height: "100%" }}>
            <Canvas
                camera={{ position: [0, 0, 3], fov: 45 }}
                style={{ background: "transparent" }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Orb rotation={rotation} scale={scale} />
            </Canvas>
        </div>
    );
}
