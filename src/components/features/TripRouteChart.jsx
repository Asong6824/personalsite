"use client"
import React, { useEffect, useRef } from "react"

function hexToNum(hex) {
  if (!hex) return 0xc83830
  const s = hex.startsWith("#") ? hex.slice(1) : hex
  const n = parseInt(s, 16)
  return Number.isNaN(n) ? 0xc83830 : n
}

export default function TripRouteChart({
  points = [],
  mainColor = "#8B7355",
  secondaryColor = "#d9cec8",
  height = 600,
  layout = "split",
  mapConfig = {}
}) {
  const serpentRef = useRef(null)
  const mapRef = useRef(null)
  const pointSeriesRef = useRef(null)
  const serpentineSeriesRef = useRef(null)

  useEffect(() => {
    let mapRoot
    let serpRoot
    let disposed = false

    const load = async () => {
      const am5 = await import("@amcharts/amcharts5")
      const am5map = await import("@amcharts/amcharts5/map")
      const am5timeline = await import("@amcharts/amcharts5/timeline")
      const am5xy = await import("@amcharts/amcharts5/xy")
      const AnimatedTheme = (await import("@amcharts/amcharts5/themes/Animated")).default

      const data = points.map(p => ({
        distance: Number(p.distance || 0),
        category: p.category || "city",
        name: p.name,
        altitude: p.altitude,
        date: typeof p.date === "number" ? p.date : new Date(p.date || Date.now()).getTime(),
        population: p.population,
        geometry: { type: "Point", coordinates: p.coordinates }
      }))

      const mainCol = am5.color(hexToNum(mainColor))
      const secondaryCol = am5.color(hexToNum(secondaryColor))

      const geoKey = mapConfig.geoKey || "region/world/europeLow"
      let geodata
      if (mapConfig.geoJSON) {
        geodata = mapConfig.geoJSON
      } else {
        const mod = await import(`@amcharts/amcharts5-geodata/${geoKey}`)
        geodata = mod.default || mod
      }

      mapRoot = am5.Root.new(mapRef.current)
      mapRoot.setThemes([AnimatedTheme.new(mapRoot)])

      const view = mapConfig.view || { type: "home", center: { lon: 8.7, lat: 50.5 }, zoom: 3 }
      const interactive = mapConfig.interactive || { pan: false, zoom: false }
      const chartMap = mapRoot.container.children.push(am5map.MapChart.new(mapRoot, {
        panX: interactive.pan ? "translateX" : "none",
        panY: interactive.pan ? "translateY" : "none",
        wheelX: interactive.zoom ? "zoomX" : "none",
        wheelY: interactive.zoom ? "zoomY" : "none",
        projection: am5map.geoMercator(),
        homeGeoPoint: view.type === "home" && view.center ? { longitude: view.center.lon, latitude: view.center.lat } : { longitude: 8.7, latitude: 50.5 },
        homeZoomLevel: view.type === "home" && typeof view.zoom === "number" ? view.zoom : 3
      }))

      const polygonSeries = chartMap.series.push(am5map.MapPolygonSeries.new(mapRoot, { geoJSON: geodata }))
      polygonSeries.mapPolygons.template.setAll({
        fill: secondaryCol,
        stroke: am5.color(0xffffff),
        strokeWidth: 1,
        strokeOpacity: 0.5
      })

      const lineSeries = chartMap.series.push(am5map.MapLineSeries.new(mapRoot, {}))
      lineSeries.mapLines.template.setAll({
        stroke: am5.color(0x000000),
        strokeDasharray: [3, 3],
        strokeWidth: 1,
        strokeOpacity: 0.5
      })

      const pointSeries = chartMap.series.push(am5map.MapPointSeries.new(mapRoot, {
        valueField: "population",
        calculateAggregates: true,
        idField: "name"
      }))
      pointSeriesRef.current = pointSeries

      const circleTemplateMap = am5.Template.new(mapRoot, {})
      pointSeries.set("heatRules", [{ target: circleTemplateMap, min: 3, max: 17, dataField: "value", key: "radius" }])

      pointSeries.bullets.push(function (root, series, dataItem) {
        const container = am5.Container.new(root, {})
        const circle = container.children.push(am5.Circle.new(root, {
          radius: 9,
          fill: mainCol,
          stroke: mainCol,
          strokeWidth: 1,
          strokeOpacity: 0.8,
          fillOpacity: 0.7,
          layer: 30
        }, circleTemplateMap))
        circle.states.create("hover", { scale: 1.4, fillOpacity: 1 })
        circle.events.on("pointerover", function (ev) {
          const di = ev.target.dataItem
          if (di && serpentineSeriesRef.current) {
            const city = di.dataContext.name
            const other = serpentineSeriesRef.current.getDataItemById(city)
            if (other && other.bullets && other.bullets[0]) {
              const cont = other.bullets[0].get("sprite")
              const c = cont.children.getIndex(0)
              if (c) c.hover()
            }
          }
        })
        circle.events.on("pointerout", function (ev) {
          const di = ev.target.dataItem
          if (di && serpentineSeriesRef.current) {
            const city = di.dataContext.name
            const other = serpentineSeriesRef.current.getDataItemById(city)
            if (other && other.bullets && other.bullets[0]) {
              const cont = other.bullets[0].get("sprite")
              const c = cont.children.getIndex(0)
              if (c) c.unhover()
            }
          }
        })
        const label = container.children.push(am5.Label.new(root, { text: "{name}", fontSize: 13, centerY: am5.p50, centerX: am5.p100, populateText: true, layer: 30, paddingRight: 4 }))
        label.adapters.add("dx", function () { return -circle.get("radius") })
        return am5.Bullet.new(root, { sprite: container, locationX: 0, locationY: 0.5 })
      })

      pointSeries.data.setAll(data)
      const pointsToConnect = []
      am5.array.each(pointSeries.dataItems, function (di) { pointsToConnect.push(di) })
      lineSeries.pushDataItem({ pointsToConnect })

      chartMap.appear(1000, 100)

      serpRoot = am5.Root.new(serpentRef.current)
      serpRoot.setThemes([AnimatedTheme.new(serpRoot)])
      const chartSerp = serpRoot.container.children.push(am5timeline.SerpentineChart.new(serpRoot, { levelCount: 3, startLocation: 0.2, endLocation: 1, wheelY: "zoomX", yAxisRadius: am5.percent(20) }))
      const yRenderer = am5timeline.AxisRendererCurveY.new(serpRoot, {})
      yRenderer.labels.template.setAll({ forceHidden: true })
      yRenderer.grid.template.set("forceHidden", true)
      const xRenderer = am5timeline.AxisRendererCurveX.new(serpRoot, { yRenderer, strokeDasharray: [2, 3], strokeWidth: 2, strokeOpacity: 0.5, stroke: am5.color(0x000000) })
      xRenderer.labels.template.setAll({ centerY: am5.p50, fontSize: 11, fill: am5.color(0x777777), minPosition: 0.01, maxPosition: 0.99 })
      xRenderer.grid.template.set("forceHidden", true)
      xRenderer.labels.template.setup = function (target) {
        target.set("layer", 30)
        target.set("background", am5.Rectangle.new(serpRoot, { fill: am5.color(0xffffff), fillOpacity: 1 }))
      }
      const yAxis = chartSerp.yAxes.push(am5xy.CategoryAxis.new(serpRoot, { maxDeviation: 0, categoryField: "category", renderer: yRenderer }))
      const xAxis = chartSerp.xAxes.push(am5xy.ValueAxis.new(serpRoot, { renderer: xRenderer, numberFormat: "#' km'" }))
      const serpSeries = chartSerp.series.push(am5timeline.CurveLineSeries.new(serpRoot, { xAxis, yAxis, baseAxis: yAxis, valueField: "population", valueXField: "distance", categoryYField: "category", idField: "name", maskBullets: false, calculateAggregates: true }))
      serpentineSeriesRef.current = serpSeries
      serpSeries.strokes.template.setAll({ forceHidden: true })
      const circleTemplateSerp = am5.Template.new(serpRoot, {})
      serpSeries.set("heatRules", [{ target: circleTemplateSerp, min: 3, max: 35, dataField: "value", key: "radius" }])
      serpSeries.bullets.push(function (root, series, dataItem) {
        const container = am5.Container.new(root, {})
        const circle = container.children.push(am5.Circle.new(root, { radius: 9, fill: mainCol, stroke: mainCol, strokeWidth: 2, strokeOpacity: 0.8, layer: 30, tooltipText: "[bold fontSize: 20px]{name}[/]\n{date.formatDate('MMM dd, yyyy')}\npopulation: {population}", tooltipY: 0, fillOpacity: 0.7 }, circleTemplateSerp))
        circle.states.create("hover", { scale: 1.5, fillOpacity: 1 })
        circle.events.on("pointerover", function (ev) {
          const di = ev.target.dataItem
          if (di && pointSeriesRef.current) {
            const city = di.dataContext.name
            const other = pointSeriesRef.current.getDataItemById(city)
            if (other && other.bullets && other.bullets[0]) {
              const cont = other.bullets[0].get("sprite")
              const c = cont.children.getIndex(0)
              if (c) c.hover()
            }
          }
        })
        circle.events.on("pointerout", function (ev) {
          const di = ev.target.dataItem
          if (di && pointSeriesRef.current) {
            const city = di.dataContext.name
            const other = pointSeriesRef.current.getDataItemById(city)
            if (other && other.bullets && other.bullets[0]) {
              const cont = other.bullets[0].get("sprite")
              const c = cont.children.getIndex(0)
              if (c) c.unhover()
            }
          }
        })
        const label = container.children.push(am5.Label.new(root, { text: "{name}", fontSize: 13, centerY: am5.p100, centerX: am5.p50, populateText: true, layer: 30 }))
        label.adapters.add("dy", function () { return -circle.get("radius") })
        return am5.Bullet.new(root, { sprite: container, locationX: 0, locationY: 0.5 })
      })
      const cursor = chartSerp.set("cursor", am5timeline.CurveCursor.new(serpRoot, { behavior: "zoomX", xAxis, yAxis }))
      cursor.lineY.set("forceHidden", true)
      cursor.lineX.set("forceHidden", true)
      serpSeries.data.setAll(data)
      yAxis.data.setAll([{ category: "city" }])
      serpSeries.appear(1000)
      chartSerp.appear(1000, 100)
    }

    load()
    return () => {
      disposed = true
      try { if (mapRoot) mapRoot.dispose() } catch {}
      try { if (serpRoot) serpRoot.dispose() } catch {}
    }
  }, [JSON.stringify(points), mainColor, secondaryColor, height, layout, JSON.stringify(mapConfig)])

  const split = layout === "split"
  return (
    <div style={{ width: "100%" }}>
      <div style={{ overflow: "auto" }}>
        <div style={{ width: split ? "50%" : "100%", height, float: split ? "left" : "none" }} ref={serpentRef} />
        <div style={{ width: split ? "50%" : "100%", height, float: split ? "left" : "none" }} ref={mapRef} />
      </div>
    </div>
  )
}