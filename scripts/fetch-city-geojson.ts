#!/usr/bin/env tsx
/**
 * 获取城市边界 GeoJSON 并简化
 * 用于 TravelRouteMap 组件的城市级地图数据
 *
 * 用法:
 *   tsx scripts/fetch-city-geojson.ts "Kanazawa,Ishikawa,Japan" kanazawa
 *   tsx scripts/fetch-city-geojson.ts "Paris,France" paris
 *
 * 输出: content/components/travel/{name}.geo.json
 */

import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "content/components/travel");

interface Point {
  lng: number;
  lat: number;
}

/**
 * Douglas-Peucker 简化算法
 */
function simplifyLine(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  const sqTolerance = tolerance * tolerance;

  function getSqDist(p1: Point, p2: Point): number {
    const dx = p1.lng - p2.lng;
    const dy = p1.lat - p2.lat;
    return dx * dx + dy * dy;
  }

  function getSqSegDist(p: Point, p1: Point, p2: Point): number {
    let x = p1.lng,
      y = p1.lat;
    let dx = p2.lng - x,
      dy = p2.lat - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p.lng - x) * dx + (p.lat - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2.lng;
        y = p2.lat;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p.lng - x;
    dy = p.lat - y;
    return dx * dx + dy * dy;
  }

  function simplifyDPStep(
    pts: Point[],
    first: number,
    last: number,
    sqTol: number,
    simplified: Point[]
  ) {
    let maxSqDist = sqTol;
    let index: number | undefined;
    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(pts[i], pts[first], pts[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }
    if (index !== undefined) {
      if (index - first > 1) simplifyDPStep(pts, first, index, sqTol, simplified);
      simplified.push(pts[index]);
      if (last - index > 1) simplifyDPStep(pts, index, last, sqTol, simplified);
    }
  }

  const last = points.length - 1;
  const simplified: Point[] = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
}

async function main() {
  const [query, name] = process.argv.slice(2);

  if (!query || !name) {
    console.error("用法: tsx scripts/fetch-city-geojson.ts <查询> <文件名>");
    console.error("  例: tsx scripts/fetch-city-geojson.ts 'Kanazawa,Ishikawa,Japan' kanazawa");
    process.exit(1);
  }

  console.log(`🔍 查询: ${query}`);

  // 1. 从 Nominatim 获取 GeoJSON
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=geojson&polygon_geojson=1&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "TravelMapComponent/1.0 (personal blog)",
    },
  });

  if (!res.ok) {
    console.error(`❌ API 请求失败: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    console.error("❌ 未找到该城市的边界数据");
    process.exit(1);
  }

  const feature = data.features[0];
  console.log(`✅ 找到: ${feature.properties.name}`);

  // 2. 统计原始坐标点数
  let originalCount = 0;
  const coords = feature.geometry.coordinates;
  if (feature.geometry.type === "Polygon") {
    coords.forEach((ring: number[][]) => (originalCount += ring.length));
  } else if (feature.geometry.type === "MultiPolygon") {
    coords.forEach((poly: number[][][]) =>
      poly.forEach((ring: number[][]) => (originalCount += ring.length))
    );
  }
  console.log(`📊 原始坐标点数: ${originalCount}`);

  // 3. 简化坐标
  if (feature.geometry.type === "Polygon") {
    feature.geometry.coordinates = feature.geometry.coordinates.map(
      (ring: number[][]) => {
        const points = ring.map(([lng, lat]) => ({ lng, lat }));
        const simplified = simplifyLine(points, 0.0005);
        return simplified.map((p) => [p.lng, p.lat]);
      }
    );
  } else if (feature.geometry.type === "MultiPolygon") {
    feature.geometry.coordinates = feature.geometry.coordinates.map(
      (poly: number[][][]) => {
        return poly.map((ring: number[][]) => {
          const points = ring.map(([lng, lat]) => ({ lng, lat }));
          const simplified = simplifyLine(points, 0.0005);
          return simplified.map((p) => [p.lng, p.lat]);
        });
      }
    );
  }

  // 4. 统计简化后
  let simplifiedCount = 0;
  const newCoords = feature.geometry.coordinates;
  if (feature.geometry.type === "Polygon") {
    newCoords.forEach((ring: number[][]) => (simplifiedCount += ring.length));
  } else if (feature.geometry.type === "MultiPolygon") {
    newCoords.forEach((poly: number[][][]) =>
      poly.forEach((ring: number[][]) => (simplifiedCount += ring.length))
    );
  }
  console.log(`📉 简化后坐标点数: ${simplifiedCount} (${Math.round((simplifiedCount / originalCount) * 100)}%)`);

  // 5. 反转坐标（d3-geo 需要 clockwise winding order 来正确渲染小范围 Polygon）
  if (feature.geometry.type === "Polygon") {
    feature.geometry.coordinates = feature.geometry.coordinates.map((ring: number[][]) => {
      return [...ring].reverse();
    });
  } else if (feature.geometry.type === "MultiPolygon") {
    feature.geometry.coordinates = feature.geometry.coordinates.map((poly: number[][][]) => {
      return poly.map((ring: number[][]) => [...ring].reverse());
    });
  }

  // 6. 保存
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const outPath = path.join(OUT_DIR, `${name}.geo.json`);
  fs.writeFileSync(outPath, JSON.stringify(feature));

  const size = fs.statSync(outPath).size;
  console.log(`💾 已保存: ${outPath} (${(size / 1024).toFixed(1)} KB)`);

  // 6. 提示注册
  console.log(`\n📝 下一步：在 TravelRouteMap.jsx 的 CITY_MODULES 中注册：`);
  console.log(`  ${name}: () => import("./${name}.geo.json"),`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
