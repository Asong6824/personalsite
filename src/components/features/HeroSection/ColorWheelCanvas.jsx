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