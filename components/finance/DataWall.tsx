"use client";

import React, { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Instance, Instances } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";

// --- Data Generation ---
const CURRENCIES = ["BTC", "ETH", "USD", "EUR", "SOL", "USDC"];
const generateHex = (length: number) => {
    let result = "0x";
    const characters = "0123456789abcdef";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        hash: generateHex(40) + "...",
        amount: (Math.random() * 10).toFixed(4),
        currency: CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)],
    }));
};

// --- Shader Material for Bending ---
// We'll modify the vertex shader to bend the geometry based on a uniform
const BendMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uBend: { value: 0 },
        uColor: { value: new THREE.Color("#1a1a1a") },
    },
    vertexShader: `
    uniform float uTime;
    uniform float uBend;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Apply instance matrix transformation first (to get world position of instance)
      // Note: In InstancedMesh, we usually work in local space, but here we want to bend 
      // the whole wall based on the "world" x position relative to the center.
      // However, since we are doing this in the material of the InstancedMesh, 
      // 'position' is the vertex position of the base geometry.
      // We need to apply the instance matrix to get the position of the instance.
      
      // Simplified approach: We will bend the entire group in the parent, 
      // OR we can try to do it here if we pass instance attributes.
      // Let's stick to a simpler approach first: 
      // The "bending" requested is likely a screen-space distortion or a vertex displacement 
      // based on X coordinate.
      
      // Let's try a simple parabolic bend on the Z axis based on X
      // But wait, 'position' is local to the box geometry. 
      // We need the instance position. 
      // In standard Three.js InstancedMesh, we can't easily access instance position in vertex shader 
      // without extra attributes or using the instanceMatrix.
      
      // Actually, let's achieve the "bending" by rotating the instances in the loop 
      // or by moving the camera/group. 
      // But the user asked for "bending/deformation".
      
      // Let's use a standard material for now and handle the "bending" logic 
      // by updating the instance matrices in useFrame, which is more expensive but easier to control logic-wise
      // for a first pass. If performance sucks, we move to shader.
      
      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      // Add a subtle border or gradient
      float strength = step(0.02, vUv.y) * step(vUv.y, 0.98);
      vec3 finalColor = mix(vec3(0.5), uColor, strength);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// --- Component ---

const ROW_HEIGHT = 1.2;
const ROW_WIDTH = 20; // Width of the bar
const GAP = 0.2;

export function DataWall() {
    const { viewport, mouse } = useThree();
    const groupRef = useRef<THREE.Group>(null);

    // Grid dimensions
    const rows = 20;
    const cols = 1; // Just one column of long bars for now, as per description "long horizontal bars"

    const data = useMemo(() => generateData(rows * cols), [rows, cols]);

    // Spring for smooth bending interaction
    const [{ bend }, api] = useSpring(() => ({ bend: 0 }));

    useFrame((state) => {
        if (!groupRef.current) return;

        // Calculate target bend based on mouse X position (normalized -1 to 1)
        // When mouse is at edges, bend more.
        const targetBend = (state.mouse.x) * 0.5;

        // Update spring
        api.start({ bend: targetBend });

        // Apply bending to the group or individual elements
        // Here we'll rotate the group slightly and maybe curve the children

        // Let's manually update positions to create a curve
        // This is "expensive" in JS but fine for < 100 items.
        const time = state.clock.getElapsedTime();

        groupRef.current.children.forEach((child, i) => {
            // The child is a Group containing the Mesh (Bar) and Text
            // We want to curve them around the Y axis (cylinder-like) or Z axis (parabola)

            const y = (i - rows / 2) * (ROW_HEIGHT + GAP);
            const x = 0;

            // Parabolic bend: Z = x^2 * k
            // But since they are horizontal bars, maybe we want them to curve *away* from the camera at the edges?
            // The user said "drag... wall will follow bending, deformation".

            // Let's try a simple cylindrical curve based on the 'bend' value.
            // We'll rotate each row slightly around Y? No, that's a twist.

            // Let's try: The wall is flat. When you drag (change bend), the whole wall curves.
            // Since these are long horizontal bars, maybe we curve the *bar itself*?
            // Curving a BoxGeometry is hard without many segments.
            // Let's assume the bars remain straight but the *arrangement* curves?
            // Or maybe the bars are short segments making up a long line?
            // User said: "Each strip is like a row of ledger... tightly packed... drag... wall bends".

            // Let's treat the whole thing as a flexible sheet.
            // We can rotate the group based on mouse X.
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.2, 0.1);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -state.mouse.y * 0.1, 0.1);

            // Add a wave effect on scroll/time
            const wave = Math.sin(time * 0.5 + i * 0.2) * 0.1;
            child.position.y = (i - rows / 2) * (ROW_HEIGHT + GAP) + wave;

            // Parallax / Shear effect
            // child.position.x = (i % 2 === 0 ? 1 : -1) * bend.get() * 2;
        });
    });

    return (
        <group ref={groupRef}>
            {data.map((item, i) => (
                <BarRow key={item.id} item={item} index={i} total={rows} />
            ))}
        </group>
    );
}

function BarRow({ item, index, total }: { item: any, index: number, total: number }) {
    // We use a Group for each row to hold the bar and the text together
    const y = (index - total / 2) * (ROW_HEIGHT + GAP);

    return (
        <group position={[0, y, 0]}>
            {/* The Bar Background */}
            <mesh>
                <boxGeometry args={[ROW_WIDTH, ROW_HEIGHT, 0.1]} />
                <meshStandardMaterial
                    color="#111"
                    emissive="#222"
                    emissiveIntensity={0.2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* The Text Content */}
            <group position={[0, 0, 0.06]}>
                {/* Hash - Left aligned (relative to bar center) */}
                <Text
                    position={[-ROW_WIDTH / 2 + 1, 0, 0]}
                    fontSize={0.4}
                    color="#666"
                    anchorX="left"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2" // Standard font
                >
                    {item.hash}
                </Text>

                {/* Amount - Right aligned */}
                <Text
                    position={[ROW_WIDTH / 2 - 1, 0, 0]}
                    fontSize={0.4}
                    color="#fff"
                    anchorX="right"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2"
                >
                    {item.amount} {item.currency}
                </Text>
            </group>
        </group>
    );
}
