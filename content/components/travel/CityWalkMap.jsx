"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

/**
 * CityWalkMap - 城市街区级步行地图
 * 基于 Leaflet + OpenStreetMap 瓦片，手绘风格化渲染
 *
 * Props:
 * - center: { lat, lng } - 地图中心
 * - zoom: number - 初始缩放级别 (默认 15)
 * - places: { name, lat, lng, note? }[] - 地点标记
 * - routeColor: string - 路线颜色
 * - height: number - 地图高度
 */
export default function CityWalkMap({
  center = { lat: 36.561, lng: 136.656 },
  zoom = 15,
  places = [],
  routeColor = "#8B7355",
  markerColor = "#c83830",
  height = 450,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let disposed = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      if (disposed) return;

      // 创建地图
      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      // 添加 OSM 瓦片（手绘风格滤镜）
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        opacity: 0.6, // 降低透明度，让手绘风格更明显
      }).addTo(map);

      // 自定义标记样式（手绘风格圆圈）
      const createIcon = (name, index) => {
        return L.divIcon({
          className: "citywalk-marker",
          html: `
            <div style="
              position: relative;
              width: 28px;
              height: 28px;
            ">
              <svg width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="10"
                  fill="${markerColor}"
                  fill-opacity="0.85"
                  stroke="${markerColor}"
                  stroke-width="1.5"
                  style="filter: url(#rough);"
                />
                <circle cx="14" cy="14" r="10"
                  fill="none"
                  stroke="${markerColor}"
                  stroke-width="1"
                  opacity="0.4"
                >
                  <animate attributeName="r" from="10" to="18" dur="2s" begin="${index * 0.3}s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="${index * 0.3}s" repeatCount="indefinite" />
                </circle>
              </svg>
              <div style="
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                font-size: 12px;
                font-weight: 600;
                color: #4a4036;
                text-shadow: 0 0 3px white, 0 0 3px white;
                pointer-events: none;
              ">${name}</div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
      };

      // 添加标记
      const markers = [];
      places.forEach((p, i) => {
        const marker = L.marker([p.lat, p.lng], {
          icon: createIcon(p.name, i),
        }).addTo(map);
        markers.push(marker);
      });

      // 绘制路线
      if (places.length > 1) {
        const latlngs = places.map((p) => [p.lat, p.lng]);
        L.polyline(latlngs, {
          color: routeColor,
          weight: 3,
          opacity: 0.8,
          dashArray: "8, 6",
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
      }

      // 自动调整视野
      if (places.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      }

      if (!disposed) setLoaded(true);
    };

    init();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center.lat, center.lng, zoom, places, routeColor, markerColor]);

  return (
    <div
      className="city-walk-map w-full rounded-lg overflow-hidden relative"
      style={{ height }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
      {/* 手绘风格滤镜覆盖层 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 60%, rgba(245,245,245,0.3) 100%)
          `,
          mixBlendMode: "multiply",
        }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 bg-[#f5f5f5]">
          地图加载中…
        </div>
      )}
    </div>
  );
}
