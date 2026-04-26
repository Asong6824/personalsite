// src/components/features/SunlitBackground.jsx
"use client";
import React from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import styles from './SunlitBackground.module.css';

const SunlitBackground = () => {
    // Tap into framer-motion global scroll tracker (0 to 1)
    const { scrollYProgress } = useScroll();

    // Overhauling the mapping engine: we will use pure 3D rotations instead of raw matrices.
    // This perfectly preserves the original image dimensions without shearing parts off-screen.
    const rotX = useTransform(scrollYProgress, [0, 1], ["4deg", "-2deg"]); 
    const rotY = useTransform(scrollYProgress, [0, 1], ["-6deg", "4deg"]); 

    // Construct a straightforward 3D CSS rotate that affects a full-size frame
    // scale(1.05) provides just enough overscan to hide the very edges during rotation
    const rawTransform = useMotionTemplate`perspective(1600px) scale(1.05) rotateX(${rotX}) rotateY(${rotY})`;

    return (
        <div className={styles.container}>
            <motion.div 
                className={styles.perspective}
                style={{ transform: rawTransform }}
            >
                {/* Static Rigid Architecture Overlay */}
                <div className={styles.shojiLattice}></div>
                
                {/* Dynamic Swaying Leaves Underlay */}
                <div className={styles.leaves}>
                    <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                        <defs>
                            <filter id="wind" x="-20%" y="-20%" width="140%" height="140%">
                                <feTurbulence type="fractalNoise" numOctaves="2" seed="1">
                                    <animate 
                                      attributeName="baseFrequency" 
                                      dur="16s" 
                                      keyTimes="0;0.33;0.66;1" 
                                      values="0.005 0.003;0.01 0.009;0.008 0.004;0.005 0.003" 
                                      repeatCount="indefinite" 
                                    />
                                </feTurbulence>
                                <feDisplacementMap in="SourceGraphic">
                                    <animate 
                                      attributeName="scale" 
                                      dur="15s" 
                                      keyTimes="0;0.25;0.5;0.75;1" 
                                      values="2;8;15;8;2" 
                                      repeatCount="indefinite" 
                                    />
                                </feDisplacementMap>
                            </filter>
                        </defs>
                    </svg>
                </div>
            </motion.div>
            
            <div className={styles.progressiveBlur}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default SunlitBackground;
