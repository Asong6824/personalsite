"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { createMapProjection, projectPoint } from "./projection";

// 区域到 geodata 模块的映射
const REGION_MODULES = {
  japan: () => import("@amcharts/amcharts5-geodata/japanLow.js"),
  world: () => import("@amcharts/amcharts5-geodata/worldLow.js"),
  china: () => import("@amcharts/amcharts5-geodata/chinaLow.js"),
  europe: () => import("@amcharts/amcharts5-geodata/continentsLow.js"),
  usa: () => import("@amcharts/amcharts5-geodata/usaLow.js"),
};

// 城市级 GeoJSON（项目内置）
const CITY_MODULES = {
  kanazawa: () => import("./kanazawa.geo.json"),
};

async function loadRegionGeoJSON(region) {
  const loader = REGION_MODULES[region];
  if (!loader) {
    throw new Error(
      `Unsupported region: "${region}". Available: ${Object.keys(REGION_MODULES).join(", ")}`
    );
  }
  const mod = await loader();
  if (region === "europe") {
    const data = mod.default || mod;
    return {
      type: "FeatureCollection",
      features: data.features.filter((f) => f.properties?.continent === "Europe"),
    };
  }
  return mod.default || mod;
}

async function loadCityGeoJSON(city) {
  const loader = CITY_MODULES[city];
  if (!loader) {
    throw new Error(
      `Unsupported city: "${city}". Available: ${Object.keys(CITY_MODULES).join(", ")}`
    );
  }
  const mod = await loader();
  // JSON 导入可能直接是对象，也可能在 default 中
  const data = mod.default || mod;
  return {
    type: "FeatureCollection",
    features: [data],
  };
}

/**
 * 旅行路线地图组件
 * 真实 GeoJSON 底图 + Rough.js 手绘风格渲染
 *
 * Props:
 * - region: 预设区域 (japan/world/china/europe/usa)
 * - customGeoJSON: 自定义 GeoJSON，优先级高于 region
 * - fit: "region" | "places" — 地图视野适配方式
 * - places: 地点数组 [{ name, lat, lng, day?, note? }]
 * - placesPaddingRatio: fit="places" 时的留白比例 (默认 0.35)
 * - showLabels: 是否显示标签
 * - routeColor: 路线颜色
 * - markerColor: 标记颜色
 * - landColor: 陆地填充色
 * - waterColor: 水域背景色
 * - height: SVG 高度
 * - roughness: 底图轮廓手绘程度
 * - routeRoughness: 路线手绘程度
 * - strokeWidth: 轮廓线宽
 */
export default function TravelRouteMap({
  region = "japan",
  city = null,
  customGeoJSON = null,
  fit = "places",
  places = [],
  placesPaddingRatio = 0.35,
  showLabels = true,
  routeColor = "#8B7355",
  markerColor = "#c83830",
  landColor = "#e8e0d5",
  waterColor = "#f5f5f5",
  height = 450,
  roughness = 0.8,
  routeRoughness = 1.5,
  strokeWidth = 0.8,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [loaded, setLoaded] = useState(false);

  // 监听容器宽度变化
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const w = el.clientWidth || 800;
      setDimensions({ width: w, height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  // 主渲染逻辑
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;
    let disposed = false;
    const svg = svgRef.current;

    const render = async () => {
      // 1. 加载 GeoJSON
      let geoJSON;
      try {
        if (customGeoJSON) {
          geoJSON = customGeoJSON;
        } else if (city) {
          geoJSON = await loadCityGeoJSON(city);
        } else {
          geoJSON = await loadRegionGeoJSON(region);
        }
      } catch (e) {
        console.error("[TravelRouteMap] Failed to load geo data:", e.message);
        return;
      }
      if (disposed) return;

      // 2. 创建投影
      const { projection, path } = createMapProjection({
        geoJSON,
        width: dimensions.width,
        height: dimensions.height,
        padding: 16,
        fit,
        places,
        placesPaddingRatio,
      });

      // 3. 清空 SVG
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // 4. 设置 viewBox 和背景
      svg.setAttribute("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);
      svg.style.backgroundColor = waterColor;

      // 5. 初始化 rough.js
      const rc = rough.svg(svg);

      // 6. 绘制底图轮廓（手绘风格）
      const landGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      landGroup.setAttribute("class", "travel-map-land");
      svg.appendChild(landGroup);

      geoJSON.features.forEach((feature) => {
        const d = path(feature);
        if (!d) return;
        const el = rc.path(d, {
          fill: landColor,
          fillStyle: "hachure",
          fillWeight: 0.5,
          hachureGap: 8,
          hachureAngle: 60,
          stroke: "#b8a99a",
          strokeWidth,
          roughness,
          bowing: 0.5,
        });
        landGroup.appendChild(el);
      });

      if (disposed) return;

      // 7. 投影地点坐标
      const projectedPlaces = places
        .map((p, idx) => {
          const [x, y] = projectPoint(projection, p.lng, p.lat);
          return { ...p, x, y, idx };
        })
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));

      if (projectedPlaces.length === 0) {
        setLoaded(true);
        return;
      }

      // 8. 绘制路线
      const routeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      routeGroup.setAttribute("class", "travel-map-route");
      svg.appendChild(routeGroup);

      // 按 day 排序（如果有 day）
      const sorted = [...projectedPlaces].sort(
        (a, b) => (a.day ?? a.idx) - (b.day ?? b.idx)
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        const line = rc.line(a.x, a.y, b.x, b.y, {
          stroke: routeColor,
          strokeWidth: 2.5,
          roughness: routeRoughness,
          bowing: 1.2,
        });
        routeGroup.appendChild(line);
      }

      // 9. 绘制标记点
      const markerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      markerGroup.setAttribute("class", "travel-map-markers");
      svg.appendChild(markerGroup);

      sorted.forEach((p, i) => {
        const circle = rc.circle(p.x, p.y, 14, {
          fill: markerColor,
          fillStyle: "solid",
          stroke: markerColor,
          strokeWidth: 1.5,
          roughness: routeRoughness,
        });
        markerGroup.appendChild(circle);

        // 涟漪效果
        const ripple = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ripple.setAttribute("cx", p.x);
        ripple.setAttribute("cy", p.y);
        ripple.setAttribute("r", "7");
        ripple.setAttribute("fill", "none");
        ripple.setAttribute("stroke", markerColor);
        ripple.setAttribute("stroke-width", "1.5");
        ripple.setAttribute("opacity", "0.6");

        const animR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animR.setAttribute("attributeName", "r");
        animR.setAttribute("from", "7");
        animR.setAttribute("to", "18");
        animR.setAttribute("dur", "2s");
        animR.setAttribute("begin", `${i * 0.3}s`);
        animR.setAttribute("repeatCount", "indefinite");

        const animOp = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animOp.setAttribute("attributeName", "opacity");
        animOp.setAttribute("from", "0.6");
        animOp.setAttribute("to", "0");
        animOp.setAttribute("dur", "2s");
        animOp.setAttribute("begin", `${i * 0.3}s`);
        animOp.setAttribute("repeatCount", "indefinite");

        ripple.appendChild(animR);
        ripple.appendChild(animOp);
        markerGroup.appendChild(ripple);
      });

      // 10. 标签
      if (showLabels) {
        const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        labelGroup.setAttribute("class", "travel-map-labels");
        svg.appendChild(labelGroup);

        sorted.forEach((p) => {
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.setAttribute("x", p.x);
          text.setAttribute("y", p.y - 16);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-size", "13");
          text.setAttribute("font-weight", "600");
          text.setAttribute("fill", "#4a4036");
          text.setAttribute("font-family", "sans-serif");
          text.setAttribute(
            "style",
            "text-shadow: 0 0 4px #f5f5f5, 0 0 4px #f5f5f5, 0 0 4px #f5f5f5;"
          );
          text.textContent = p.name;
          labelGroup.appendChild(text);
        });
      }

      if (!disposed) setLoaded(true);
    };

    render();

    return () => {
      disposed = true;
      if (svg) {
        while (svg.firstChild) {
          svg.removeChild(svg.firstChild);
        }
      }
    };
  }, [
    region,
    city,
    customGeoJSON,
    fit,
    places,
    placesPaddingRatio,
    showLabels,
    routeColor,
    markerColor,
    landColor,
    waterColor,
    dimensions.width,
    dimensions.height,
    roughness,
    routeRoughness,
    strokeWidth,
  ]);

  return (
    <div
      ref={containerRef}
      className="travel-route-map w-full rounded-lg overflow-hidden"
      style={{ backgroundColor: waterColor }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
      {!loaded && (
        <div
          className="flex items-center justify-center text-sm text-gray-400"
          style={{ height: dimensions.height }}
        >
          地图加载中…
        </div>
      )}
    </div>
  );
}
