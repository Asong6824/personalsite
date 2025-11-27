"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

/**
 * Mermaid Diagram Component
 * Renders a mermaid diagram from a string definition.
 */
export function Mermaid({ chart }) {
    const containerRef = useRef(null);
    const [svg, setSvg] = useState('');

    useEffect(() => {
        // Initialize mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
        });

        const renderDiagram = async () => {
            if (containerRef.current && chart) {
                try {
                    // Generate a unique ID for each diagram
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                    // Render the diagram
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    // In case of error, we might want to show the raw code or an error message
                    setSvg(`<pre class="text-red-500 text-xs p-2 bg-red-50 rounded">${error.message}</pre>`);
                }
            }
        };

        renderDiagram();
    }, [chart]);

    return (
        <div
            ref={containerRef}
            className="mermaid-container my-8 flex justify-center overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
