"use client";

import React from 'react';
import { DataWall } from './DataWall';

export default function TempoBackground({ config, targetTwist, theme }) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            <DataWall
                config={config}
                targetTwist={targetTwist}
                theme={theme}
            />
        </div>
    );
}
