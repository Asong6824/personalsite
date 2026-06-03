"use client";

import { geoMercator, geoPath } from "d3-geo";

/**
 * 基于传入的地点计算带 padding 的 bbox GeoJSON
 */
function placesToBboxGeoJSON(places, paddingRatio = 0.25) {
  if (!places || places.length === 0) return null;

  const lons = places.map((p) => p.lng);
  const lats = places.map((p) => p.lat);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // 如果只有一个点，扩大范围
  const lonPad = maxLon === minLon ? 1 : (maxLon - minLon) * paddingRatio;
  const latPad = maxLat === minLat ? 1 : (maxLat - minLat) * paddingRatio;

  // 确保最小视野（约 50km × 50km）
  const minSpan = 0.5;
  const lonSpan = Math.max(maxLon - minLon, minSpan);
  const latSpan = Math.max(maxLat - minLat, minSpan);

  const w = minLon - lonPad;
  const e = maxLon + lonPad;
  const s = minLat - latPad;
  const n = maxLat + latPad;

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  };
}

/**
 * 创建适合给定 GeoJSON 和容器尺寸的投影与 path 生成器
 *
 * @param {object} options
 * @param {object} options.geoJSON - 区域 GeoJSON FeatureCollection
 * @param {number} options.width - 画布宽度
 * @param {number} options.height - 画布高度
 * @param {number} options.padding - 内边距（px）
 * @param {string} options.fit - "region" 适配整个区域，"places" 适配地点所在区域
 * @param {Array} options.places - 地点数组（fit="places" 时必需）
 * @param {number} options.placesPaddingRatio - 地点周围的留白比例
 * @returns {{ projection: Function, path: Function }}
 */
export function createMapProjection({
  geoJSON,
  width,
  height,
  padding = 20,
  fit = "region",
  places = [],
  placesPaddingRatio = 0.35,
}) {
  const projection = geoMercator();
  const path = geoPath().projection(projection);

  let targetGeoJSON = geoJSON;

  if (fit === "places") {
    const bbox = placesToBboxGeoJSON(places, placesPaddingRatio);
    if (bbox) {
      targetGeoJSON = bbox;
    }
  }

  projection.fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding],
    ],
    targetGeoJSON
  );

  return { projection, path };
}

/**
 * 将经纬度投影为 SVG 坐标
 * @param {Function} projection - d3 geo projection
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {[number, number]} [x, y]
 */
export function projectPoint(projection, lng, lat) {
  return projection([lng, lat]);
}
