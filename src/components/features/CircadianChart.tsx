import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent, GraphicComponent } from 'echarts/components';
import { LineChart, ScatterChart, BarChart, CustomChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// Register components (module-scoped flag to avoid duplicating registration)
let CIRCADIAN_REGISTERED = typeof window !== 'undefined' ? (window as any).__CIRCADIAN_REGISTERED__ : false;
if (!CIRCADIAN_REGISTERED) {
  echarts.use([GridComponent, TooltipComponent, GraphicComponent, LineChart, ScatterChart, BarChart, CustomChart, CanvasRenderer]);
  if (typeof window !== 'undefined') (window as any).__CIRCADIAN_REGISTERED__ = true;
  CIRCADIAN_REGISTERED = true;
}

// Utility: map hour 6..30 (next day 6==30) to sine y
function sineY(x, amplitude = 1, phase = 0) {
  // x in hours where 6 maps to 0
  const t = (x - 6) * Math.PI / 12; // period 24h -> 2π
  return amplitude * Math.sin(t + phase);
}

export default function CircadianChart({ hourly = [], height = 200, latitude = 35.6762, longitude = 139.6503 }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  // 略微增大曲线幅度
  const AMPLITUDE = 1.15;

  // Build data: x from 6..30 (inclusive), y = sine, val from hourly[0..23]
  const xHours = Array.from({ length: 25 }, (_, i) => 6 + i); // 6 .. 30
  const activityVals = Array.from({ length: 25 }, (_, i) => hourly[(6 + i) % 24] ?? 0);
  const lineData = xHours.map((x) => [x, sineY(x, AMPLITUDE)]);
  const scatterData = xHours
    .map((x, idx) => {
      const val = activityVals[idx];
      const opacity = Math.min(0.95, 0.40 + (val || 0) / 150);
      return { value: [x, sineY(x, AMPLITUDE), val], itemStyle: { opacity } };
    })
    .filter(d => ![6, 18, 30].includes(d.value[0]));

  useEffect(() => {
    if (!ref.current) return;
    const chart = chartRef.current || echarts.init(ref.current);
    chartRef.current = chart;

    const chartBg = 'transparent';
    const isDark = document.documentElement.classList.contains('dark');
    const cssVars = getComputedStyle(document.documentElement);
    const axisText = cssVars.getPropertyValue('--muted-foreground').trim() || cssVars.getPropertyValue('--foreground').trim();
    const curveColor = cssVars.getPropertyValue('--chart-3').trim() || cssVars.getPropertyValue('--foreground').trim();
    const dotBaseColor = (cssVars.getPropertyValue('--primary').trim() || cssVars.getPropertyValue('--chart-1').trim() || cssVars.getPropertyValue('--foreground').trim());
    const gridColor = cssVars.getPropertyValue('--border').trim() || (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)');
    
    const fgColor = cssVars.getPropertyValue('--foreground').trim() || (isDark ? '#f5f5f5' : '#111111');
    const dayNightRects = [
      // day: 6..18（使用前景色的低不透明度叠加，暗色变亮、亮色变暗）
      { x0: 6, x1: 18, color: fgColor, opacity: isDark ? 0.06 : 0.06 },
      // night: 18..30
      { x0: 18, x1: 30, color: fgColor, opacity: isDark ? 0.04 : 0.04 },
    ];

    const iconSize = 20;
    const icons = {
      sunrise: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="orange" d="M12 4l2 2h-4l2-2zm0 4a6 6 0 016 6H6a6 6 0 016-6zm-7 8h14v2H5v-2z"/></svg>`),
      sun: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="orange"/><g stroke="orange" stroke-width="2"><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/></g></svg>`),
      dusk: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="orange" d="M3 17h18v2H3z"/><path fill="orange" opacity="0.8" d="M12 6a6 6 0 016 6H6a6 6 0 016-6z"/></svg>`),
      moon: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="rgba(255,165,0,0.9)" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`),
    };

    const minY = -AMPLITUDE - 0.55;
    const maxY = AMPLITUDE + 0.55;

    const option = {
      backgroundColor: chartBg,
      grid: { left: 24, right: 24, top: 24, bottom: 36 },
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'none' },
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params;
          const h = Math.round(p.value[0] % 24);
          const v = Math.round(p.value[2] ?? 0);
          return `${h.toString().padStart(2, '0')}:00 · ${v}`;
        }
      },
      xAxis: {
        type: 'value', min: 6, max: 30, interval: 6,
        axisLabel: {
          color: axisText,
          showMinLabel: true,
          showMaxLabel: true,
          formatter: (val) => {
            const v = Math.round(val);
            if (v % 6 !== 0) return '';
            if (v === 24) return '24:00';
            const h = v % 24;
            return `${h.toString().padStart(2, '0')}:00`;
          }
        },
        axisLine: { lineStyle: { color: gridColor } },
        axisTick: { show: false },
        splitLine: { show: false }
      },
      yAxis: { type: 'value', min: minY, max: maxY, axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
      series: [
        // Background day/night rects using custom series
        {
          type: 'custom',
          renderItem: (params, api) => {
            const x0 = api.coord([api.value(0), minY]);
            const x1 = api.coord([api.value(1), maxY]);
            const fill = api.value(2);
            const opacity = api.value(3);
            const width = x1[0] - x0[0];
            const height = x1[1] - x0[1];
            return {
              type: 'rect',
              shape: { x: x0[0], y: x0[1], width, height },
              style: { fill, opacity }
            };
          },
          data: dayNightRects.map(r => [r.x0, r.x1, r.color, r.opacity]),
          silent: true,
          z: 0
        },

        // Sine curve
        {
          type: 'line', name: 'trajectory', data: lineData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: curveColor, width: 2, opacity: 0.6 },
           z: 10
        },

        // Scatter points along the curve with size/brightness mapped to activity
         {
           type: 'scatter', name: 'activity', data: scatterData,
           symbolSize: (val) => {
             const intensity = val[2] || 0; // 0..100
             return 6 + Math.min(14, Math.round(intensity / 6));
           },
           itemStyle: {
             color: dotBaseColor,
             shadowBlur: 4,
             shadowColor: gridColor
           },
           emphasis: { scale: 1.1 },
           z: 20
        },

        // Vertical dashed marks at 12/18/24
        ...[12, 18, 24].map(h => ({
          type: 'line', name: `mark-${h}`,
          data: [[h, minY], [h, maxY]],
          lineStyle: { type: 'dashed', color: gridColor, width: 1 },
          symbol: 'none',
          z: 5
        })),
      ]
    };

    chart.setOption(option);

    const buildIconElements = () => {
      const entries = [
        [6, 'sunrise'],
        [12, 'sun'],
        [18, 'dusk'],
        [24, 'moon'],
        [30, 'sunrise']
      ];
      // Pre-compute pixel scale for Y to map data-space gap to pixels
      const yMinPx = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [12, minY])[1];
      const yMaxPx = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [12, maxY])[1];
      const pixelsPerData = Math.abs(yMaxPx - yMinPx) / (maxY - minY);
      const marginPx = 8; // extra clearance to guarantee no overlap

      return entries.map(([hour, key]) => {
        const baseY = sineY(hour, AMPLITUDE);
        const dataMargin = 0.06;
        const OFF_ABOVE = 0.30;
        const OFF_BELOW = 0.30;
        let targetY = baseY;

        // For 12 and 24, ensure icon never overlaps the biggest scatter dot
        if ((hour === 12 && key === 'sun') || (hour === 24 && key === 'moon')) {
           const intensity = activityVals[(hour - 6)] || 0;
           const dotSize = 6 + Math.min(14, Math.round(intensity / 6));
           const dotRadius = dotSize / 2;
           const requiredDataOffset = (dotRadius + iconSize / 2 + marginPx) / pixelsPerData;
           const baseOffset = hour === 12 ? OFF_ABOVE : OFF_BELOW;
           const offset = Math.max(baseOffset, requiredDataOffset);
           const halfIconData = (iconSize / 2) / pixelsPerData;
           const offsetPlus = offset + halfIconData;
           if (hour === 12) {
             targetY = Math.min(maxY - dataMargin, baseY + offsetPlus);
           } else {
             targetY = Math.max(minY + dataMargin, baseY - offsetPlus);
           }
         }

        const pt = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [hour, targetY]);

        // Clamp within the plot grid to avoid overlapping header and x-axis
        const containerHeight = ref.current?.clientHeight || height;
        const gridTop = 24, gridBottom = 36;
        const minTop = gridTop + 6;
        const maxTop = containerHeight - gridBottom - iconSize - 6;
        let clampedTop = Math.min(Math.max(pt[1] - iconSize / 2, minTop), maxTop);

        // Pixel-level non-overlap: ensure center-to-center gap with dot
        if (hour === 12 || hour === 24) {
          const dotPt = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [hour, baseY]);
          const intensity = activityVals[(hour - 6)] || 0;
          const dotSize = 6 + Math.min(14, Math.round(intensity / 6));
          const dotRadius = dotSize / 2;
          const blurExtra = 2; // account for shadowBlur visual expansion
          const safeGapPx = dotRadius + iconSize / 2 + marginPx + blurExtra;
          const iconCenterY = clampedTop + iconSize / 2;
          const dotCenterY = dotPt[1];
          if (hour === 12) {
            const maxIconCenter = dotCenterY - safeGapPx;
            const desiredTop = Math.min(maxTop, Math.max(minTop, maxIconCenter - iconSize / 2));
            if (iconCenterY > maxIconCenter) clampedTop = desiredTop;
          } else {
            const minIconCenter = dotCenterY + safeGapPx;
            const desiredTop = Math.min(maxTop, Math.max(minTop, minIconCenter - iconSize / 2));
            if (iconCenterY < minIconCenter) clampedTop = desiredTop;
          }
        }

        return {
          type: 'image',
          style: { image: icons[key], width: iconSize, height: iconSize },
          left: pt[0] - iconSize / 2,
          top: clampedTop,
          z: 30,
          silent: true,
          id: `icon-${key}-${hour}`
        };
      });
    };

    let rafId = null;
    const applyIcons = () => {
      chart.setOption({ graphic: buildIconElements() }, false, true);
    };
    rafId = requestAnimationFrame(applyIcons);

    const onResize = () => {
      chart.resize();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(applyIcons);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      chart.dispose();
      chartRef.current = null;
    };
  }, [hourly]);

  return (
    <div ref={ref} style={{ width: '100%', height }} />
  );
}