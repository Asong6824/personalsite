"use client";

import React from 'react';

export default function DebugPanel({ config, setConfig, themes, onRandomize, isOpen, toggleOpen }) {
    if (!isOpen) return null;

    const currentTheme = themes[config.themeId] || themes[0];

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-[#050505] border border-white/10 rounded-lg p-5 w-[320px] text-white shadow-2xl font-mono text-[11px] tracking-wide select-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white tracking-widest">DEBUG PANEL</h3>
                <button
                    onClick={toggleOpen}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-6">
                {/* Zoom Slider */}
                <div>
                    <div className="flex justify-between mb-2 text-gray-400">
                        <span>ZOOM</span>
                        <span>{config.zoom}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={config.zoom}
                        onChange={(e) => setConfig({ ...config, zoom: parseInt(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>

                {/* Twist Slider */}
                <div>
                    <div className="flex justify-between mb-2 text-gray-400">
                        <span>TWIST (FAN)</span>
                        <span>{config.twist.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={config.twist}
                        onChange={(e) => setConfig({ ...config, twist: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>

                {/* Tilt X Slider */}
                <div>
                    <div className="flex justify-between mb-2 text-gray-400">
                        <span>TILT X (PITCH)</span>
                        <span>{config.tiltX.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={config.tiltX}
                        onChange={(e) => setConfig({ ...config, tiltX: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>

                {/* Tilt Y Slider */}
                <div>
                    <div className="flex justify-between mb-2 text-gray-400">
                        <span>TILT Y (YAW)</span>
                        <span>{config.tiltY.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={config.tiltY}
                        onChange={(e) => setConfig({ ...config, tiltY: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>

                {/* Color Theme Grid */}
                <div>
                    <div className="flex justify-between mb-3 text-gray-400">
                        <span>COLOR THEME [0-7]</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {themes.map((theme, idx) => (
                            <button
                                key={idx}
                                onClick={() => setConfig({ ...config, themeId: idx })}
                                className={`h-8 rounded-md transition-all duration-200 ${config.themeId === idx
                                    ? 'ring-2 ring-blue-500 scale-110 z-10'
                                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                                    }`}
                                style={{ backgroundColor: theme.accent }}
                                title={theme.name}
                            />
                        ))}
                    </div>
                    <div className="text-right text-gray-500 h-4">
                        {currentTheme.name}
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-white group-hover:text-blue-400 transition-colors">
                            <span className="inline-block w-4 mr-2">📺</span>
                            FULL CANVAS MODE [F]
                        </span>
                        <input
                            type="checkbox"
                            checked={config.fullCanvas}
                            onChange={() => setConfig({ ...config, fullCanvas: !config.fullCanvas })}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-offset-gray-900"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-white group-hover:text-blue-400 transition-colors">
                            <span className="inline-block w-4 mr-2">☾</span>
                            LIGHT/DARK MODE [M]
                        </span>
                        <input
                            type="checkbox"
                            checked={config.isDark}
                            onChange={() => setConfig({ ...config, isDark: !config.isDark })}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-offset-gray-900"
                        />
                    </label>
                </div>

                {/* Footer */}
                <div className="pt-4 mt-2">
                    <button
                        onClick={onRandomize}
                        className="w-full py-3 bg-black border border-white/10 hover:bg-white/5 transition-colors text-center text-white tracking-widest text-[10px] rounded"
                    >
                        PRESS [SPACEBAR] TO RANDOMIZE
                    </button>
                </div>
            </div>
        </div>
    );
}
