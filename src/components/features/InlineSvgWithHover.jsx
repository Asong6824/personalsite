"use client"
import React, { useEffect, useRef } from "react"

export default function InlineSvgWithHover({ src, className, style, idToLabel, hoverStyle, onRegionClick }) {
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let aborted = false

    const tooltip = document.createElement("div")
    tooltip.style.position = "absolute"
    tooltip.style.pointerEvents = "none"
    tooltip.style.padding = "4px 8px"
    tooltip.style.borderRadius = "4px"
    tooltip.style.fontSize = "12px"
    tooltip.style.background = "rgba(0,0,0,0.75)"
    tooltip.style.color = "#fff"
    tooltip.style.transform = "translate(-50%, -140%)"
    tooltip.style.whiteSpace = "nowrap"
    tooltip.style.display = "none"
    el.appendChild(tooltip)
    tooltipRef.current = tooltip

    const fetchAndInject = async () => {
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        if (aborted) return
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, "image/svg+xml")
        const svg = doc.documentElement
        if (!svg || svg.nodeName.toLowerCase() !== "svg") return
        const paths = svg.querySelectorAll("path")
        paths.forEach((p, idx) => {
          if (!p.getAttribute("id")) {
            p.setAttribute("id", `region-${idx + 1}`)
          }
          p.style.cursor = "pointer"
        })
        // Ensure SVG takes full container size
        svg.setAttribute("width", "100%")
        svg.setAttribute("height", "100%")
        el.innerHTML = ""
        el.appendChild(svg)
      } catch (e) {
        // no-op
      }
    }

    fetchAndInject()

    let lastTarget = null

    const applyHover = (p) => {
      if (!p) return
      if (!p.dataset._prevTransform) {
        p.dataset._prevTransform = p.style.transform || ""
      }
      if (!p.dataset._prevTransformOrigin) {
        p.dataset._prevTransformOrigin = p.style.transformOrigin || ""
      }
      if (!p.dataset._prevTransformBox) {
        p.dataset._prevTransformBox = p.style.transformBox || ""
      }
      if (!p.dataset._prevFilter) {
        p.dataset._prevFilter = p.style.filter || ""
      }
      const hs = hoverStyle || {}
      p.style.transformBox = "fill-box"
      p.style.transformOrigin = "center"
      p.style.transform = "scale(1.1)"
      p.style.filter = hs.filter || "brightness(1.12)"
    }

    const clearHover = (p) => {
      if (!p) return
      if (p.dataset._prevTransform !== undefined) {
        p.style.transform = p.dataset._prevTransform
      }
      if (p.dataset._prevTransformOrigin !== undefined) {
        p.style.transformOrigin = p.dataset._prevTransformOrigin
      }
      if (p.dataset._prevTransformBox !== undefined) {
        p.style.transformBox = p.dataset._prevTransformBox
      }
      if (p.dataset._prevFilter !== undefined) {
        p.style.filter = p.dataset._prevFilter
      }
    }

    const onMove = (ev) => {
      const target = ev.target
      const tt = tooltipRef.current
      if (!tt) return
      if (target && target.tagName && target.tagName.toLowerCase() === "path") {
        if (lastTarget !== target) {
          clearHover(lastTarget)
          applyHover(target)
          lastTarget = target
        }
        const id = target.getAttribute("id") || "unknown"
        tt.textContent = (idToLabel && idToLabel[id]) ? idToLabel[id] : id
        tt.style.display = "block"
        const rect = el.getBoundingClientRect()
        const x = ev.clientX - rect.left
        const y = ev.clientY - rect.top
        tt.style.left = `${x}px`
        tt.style.top = `${y}px`
      } else {
        clearHover(lastTarget)
        lastTarget = null
        tt.style.display = "none"
      }
    }
    const onLeave = () => {
      const tt = tooltipRef.current
      if (tt) tt.style.display = "none"
      clearHover(lastTarget)
      lastTarget = null
    }
    const onClick = (ev) => {
      const target = ev.target
      if (target && target.tagName && target.tagName.toLowerCase() === "path") {
        const id = target.getAttribute("id") || "unknown"
        const label = (idToLabel && idToLabel[id]) ? idToLabel[id] : id
        if (typeof onRegionClick === "function") {
          onRegionClick(id, label)
        }
      }
    }
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    el.addEventListener("click", onClick)

    return () => {
      aborted = true
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
      el.removeEventListener("click", onClick)
      if (tooltipRef.current) {
        try { el.removeChild(tooltipRef.current) } catch {}
      }
    }
  }, [src, idToLabel, hoverStyle, onRegionClick])

  return (
    <div ref={containerRef} className={className} style={style} />
  )
}

