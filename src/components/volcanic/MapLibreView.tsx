'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Map as MaplibreMap,
  Marker,
  Popup,
  type Map as MaplibreMapType,
  type Marker as MaplibreMarkerType,
  type Popup as MaplibrePopupType,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { EventListItem, AviationColor } from './types'

interface MapLibreViewProps {
  volcanoes: Array<{
    id: string
    code: string
    name: string
    lat: number
    lng: number
    summitMAsl: number
    aviationColor: AviationColor
    eventCount: number
  }>
  events: EventListItem[]
  selectedEventId: string | null
  onSelectEvent: (id: string) => void
  selectedGeometry: {
    polygons: Array<{ geometry: any; metric: string; value: number; nMembers: number; nIntersect: number; verticalBand: string }>
    trajectories: Array<{ geometry: any; verticalBand: string }>
    vaacPolygons: Array<{ geometry: any; flightLevel: string; ashTopMAsl: number | null; movementText: string | null; confidence: string; observedAt: string }>
    adminAreas: Array<{ name: string; lat: number; lng: number; ratio: number; isConfirmed: boolean }>
    windLevels: Array<{ pressureHpa: number; zMAsl: number; windFromDeg: number; speedMs: number; moveToDeg: number }>
    volcanoLat?: number
    volcanoLng?: number
  } | null
  showModelLayer: boolean
  showWindLayer: boolean
  showPrecipLayer: boolean
  showVaacLayer: boolean
}

const COLOR_HEX: Record<AviationColor, string> = {
  GREEN: '#34d399',
  YELLOW: '#fcd34d',
  ORANGE: '#fb923c',
  RED: '#f87171',
}

// Hatching pattern untuk footprint model (orange arsir)
function makeHatchPattern(map: MaplibreMapType) {
  if (map.getLayer('footprint-hatch')) return
  const size = 8
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(251, 146, 60, 0.10)'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(251, 146, 60, 0.85)'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(0, size)
  ctx.lineTo(size, 0)
  ctx.stroke()
  const img = ctx.getImageData(0, 0, size, size)
  if (!map.hasImage('hatch-orange')) {
    map.addImage('hatch-orange', img as any, { sdf: false })
  }
}

export function MapLibreView({
  volcanoes,
  events,
  selectedEventId,
  onSelectEvent,
  selectedGeometry,
  showModelLayer,
  showWindLayer,
  showPrecipLayer,
  showVaacLayer,
}: MapLibreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MaplibreMapType | null>(null)
  const markersRef = useRef<Map<string, MaplibreMarkerType>>(new Map())
  const [mapReady, setMapReady] = useState(false)

  // Init map sekali
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new MaplibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: 'osm-base',
            type: 'raster',
            source: 'osm-tiles',
            paint: {
              'raster-saturation': -0.3,
              'raster-contrast': 0.05,
            },
          },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [117, -2],
      zoom: 4.4,
      minZoom: 3.5,
      maxZoom: 12,
      attributionControl: { compact: true },
    })

    map.on('load', () => {
      setMapReady(true)
      // Expose map untuk debug/testing
      ;(window as any).__volcanicMap = map
    })

    // Handle container resize (mis. saat sheet/panel buka-tutup mengubah layout)
    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    mapRef.current = map

    return () => {
      resizeObserver.disconnect()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Volcano markers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    const activeVolcanoIds = new Set(events.map((e) => e.volcano.id))
    const eventByVolcano = new Map<string, EventListItem>()
    for (const e of events) eventByVolcano.set(e.volcano.id, e)

    for (const v of volcanoes) {
      const isActive = activeVolcanoIds.has(v.id)
      const ev = eventByVolcano.get(v.id)
      const isSelected = ev?.id === selectedEventId
      const color = COLOR_HEX[v.aviationColor]

      const el = document.createElement('div')
      el.style.cursor = 'pointer'
      el.innerHTML = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          ${isActive ? `<div style="position:absolute;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle,${color}66 0%,transparent 70%);top:-4px;left:-4px;animation:vpulse 2.4s ease-in-out infinite;"></div>` : ''}
          <div style="width:${isActive ? 12 : 9}px;height:${isActive ? 12 : 9}px;border-radius:50%;background:${color};border:2px solid #0f1418;box-shadow:0 0 0 1px ${color}88;${isActive ? 'animation:vpulse 2.4s ease-in-out infinite;' : ''}"></div>
          ${isActive || isSelected ? `<div style="font-size:9px;font-weight:600;color:#f1f5f9;background:rgba(15,20,24,0.8);padding:1px 4px;border-radius:3px;margin-top:2px;white-space:nowrap;text-shadow:0 1px 2px #000;">${v.name}</div>` : ''}
        </div>
      `
      el.addEventListener('click', () => {
        if (ev) onSelectEvent(ev.id)
      })

      const marker = new Marker({ element: el })
        .setLngLat([v.lng, v.lat])
        .addTo(map)

      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 14,
        className: 'vp-popup',
      }).setHTML(
        `<div style="font-family:var(--font-geist-sans,system-ui);font-size:11px;line-height:1.4;">
          <div style="font-weight:600;color:${color};font-size:11px;">${v.name}</div>
          <div style="color:#94a3b8;font-size:10px;">${v.code} · ${v.province}</div>
          <div style="color:#cbd5e1;font-size:10px;margin-top:2px;">Puncak: ${v.summitMAsl.toLocaleString('id-ID')} m ASL · ${v.aviationColor}</div>
          <div style="color:#94a3b8;font-size:10px;margin-top:2px;">${v.eventCount > 0 ? `<span style="color:#fb923c;">${v.eventCount} kejadian aktif</span>` : 'Tidak ada kejadian aktif'}</div>
        </div>`
      )
      el.addEventListener('mouseenter', () => marker.setPopup(popup).addPopup(popup))
      el.addEventListener('mouseleave', () => marker.removePopup())

      markersRef.current.set(v.id, marker)
    }
  }, [volcanoes, events, selectedEventId, onSelectEvent, mapReady])

  // Update layers for selected event geometry
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const layersToRemove = [
      'footprint-fill',
      'footprint-line',
      'trajectory-line',
      'vaac-fill-0',
      'vaac-line-0',
      'vaac-fill-1',
      'vaac-line-1',
      'vaac-fill-2',
      'vaac-line-2',
      'admin-circles',
      'admin-labels',
      'wind-arrows',
      'precip-circles',
    ]
    const sourcesToRemove = [
      'footprint-src',
      'trajectory-src',
      'vaac-src-0',
      'vaac-src-1',
      'vaac-src-2',
      'admin-src',
      'wind-src',
      'precip-src',
    ]
    for (const l of layersToRemove) {
      if (map.getLayer(l)) map.removeLayer(l)
    }
    for (const s of sourcesToRemove) {
      if (map.getSource(s)) map.removeSource(s)
    }

    if (!selectedGeometry) return

    makeHatchPattern(map)

    // --- Footprint polygon (model, orange hatched) ---
    if (showModelLayer && selectedGeometry.polygons.length > 0) {
      const fc = {
        type: 'FeatureCollection',
        features: selectedGeometry.polygons.map((p) => ({
          type: 'Feature',
          geometry: p.geometry,
          properties: {
            metric: p.metric,
            value: p.value,
            nMembers: p.nMembers,
            nIntersect: p.nIntersect,
            verticalBand: p.verticalBand,
          },
        })),
      }
      map.addSource('footprint-src', { type: 'geojson', data: fc as any })
      map.addLayer({
        id: 'footprint-fill',
        type: 'fill',
        source: 'footprint-src',
        paint: {
          'fill-pattern': 'hatch-orange',
        },
      })
      map.addLayer({
        id: 'footprint-line',
        type: 'line',
        source: 'footprint-src',
        paint: {
          'line-color': '#fb923c',
          'line-width': 1.8,
          'line-dasharray': [2, 1.5],
          'line-opacity': 0.9,
        },
      })
    }

    // --- Trajectory screening (dashed amber) ---
    if (showModelLayer && selectedGeometry.trajectories.length > 0) {
      const fc = {
        type: 'FeatureCollection',
        features: selectedGeometry.trajectories.map((t) => ({
          type: 'Feature',
          geometry: t.geometry,
          properties: { verticalBand: t.verticalBand },
        })),
      }
      map.addSource('trajectory-src', { type: 'geojson', data: fc as any })
      map.addLayer({
        id: 'trajectory-line',
        type: 'line',
        source: 'trajectory-src',
        paint: {
          'line-color': '#fbbf24',
          'line-width': 2.2,
          'line-dasharray': [6, 4],
          'line-opacity': 0.85,
        },
      })
    }

    // --- VAAC advisory polygons (magenta outline per flight level) ---
    if (showVaacLayer && selectedGeometry.vaacPolygons.length > 0) {
      const vaacFcs = selectedGeometry.vaacPolygons.map((p) => ({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: p.geometry, properties: { flightLevel: p.flightLevel, movementText: p.movementText, confidence: p.confidence } }],
      }))
      const vaacFills = ['rgba(217, 70, 239, 0.12)', 'rgba(192, 38, 211, 0.16)', 'rgba(162, 28, 175, 0.20)']
      const vaacLines = ['#e879f9', '#d946ef', '#c026d3']
      vaacFcs.forEach((fc, i) => {
        const srcId = `vaac-src-${i}`
        const fillId = `vaac-fill-${i}`
        const lineId = `vaac-line-${i}`
        try {
          map.addSource(srcId, { type: 'geojson', data: fc as any })
          map.addLayer({
            id: fillId,
            type: 'fill',
            source: srcId,
            paint: { 'fill-color': vaacFills[i], 'fill-outline-color': vaacLines[i] },
          })
          map.addLayer({
            id: lineId,
            type: 'line',
            source: srcId,
            paint: { 'line-color': vaacLines[i], 'line-width': 2.2 },
          })
        } catch (e) {
          console.error(`[MapView] VAAC layer ${i} failed:`, e)
        }
      })
    }

    // --- Admin area markers ---
    if (showModelLayer && selectedGeometry.adminAreas.length > 0) {
      const fc = {
        type: 'FeatureCollection',
        features: selectedGeometry.adminAreas.map((a) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
          properties: { name: a.name, ratio: a.ratio, isConfirmed: a.isConfirmed },
        })),
      }
      map.addSource('admin-src', { type: 'geojson', data: fc as any })
      map.addLayer({
        id: 'admin-circles',
        type: 'circle',
        source: 'admin-src',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'ratio'], 0, 5, 1, 14],
          'circle-color': ['case', ['get', 'isConfirmed'], '#dc2626', '#f59e0b'],
          'circle-opacity': 0.6,
          'circle-stroke-color': ['case', ['get', 'isConfirmed'], '#dc2626', '#f59e0b'],
          'circle-stroke-width': 1.5,
        },
      })
      map.addLayer({
        id: 'admin-labels',
        type: 'symbol',
        source: 'admin-src',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 10,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#e2e8f0',
          'text-halo-color': '#0f1418',
          'text-halo-width': 1.5,
        },
      })
    }

    // --- Wind arrows at multiple levels near volcano ---
    if (showWindLayer && selectedGeometry.windLevels.length > 0 && selectedGeometry.volcanoLat != null && selectedGeometry.volcanoLng != null) {
      const vlat = selectedGeometry.volcanoLat
      const vlng = selectedGeometry.volcanoLng
      const colors = ['#38bdf8', '#4ade80', '#c084fc']
      const features = selectedGeometry.windLevels.slice(0, 5).map((l, i) => {
        const rad = (l.moveToDeg * Math.PI) / 180
        const len = 0.4 + l.speedMs * 0.03
        const dlng = Math.sin(rad) * len
        const dlat = Math.cos(rad) * len
        const offsetLat = (i - 2) * 0.18
        const offsetLng = (i - 2) * 0.06
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [vlng + offsetLng, vlat + offsetLat],
              [vlng + offsetLng + dlng, vlat + offsetLat + dlat],
            ],
          },
          properties: {
            color: colors[i % 3],
            pressureHpa: l.pressureHpa,
            speedMs: l.speedMs,
            moveToDeg: l.moveToDeg,
          },
        }
      })
      map.addSource('wind-src', { type: 'geojson', data: { type: 'FeatureCollection', features } as any })
      map.addLayer({
        id: 'wind-arrows',
        type: 'line',
        source: 'wind-src',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.9,
        },
      })
    }

    // --- Precipitation circles near volcano ---
    if (showPrecipLayer && selectedGeometry.windLevels.length > 0 && selectedGeometry.volcanoLat != null && selectedGeometry.volcanoLng != null) {
      const vlat = selectedGeometry.volcanoLat
      const vlng = selectedGeometry.volcanoLng
      const rainy = selectedGeometry.windLevels.filter((l) => l.precipMm > 0)
      const features = rainy.map((l, i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [vlng + (i - rainy.length / 2) * 0.05, vlat] },
        properties: { precipMm: l.precipMm, r: 5 + l.precipMm * 8 },
      }))
      map.addSource('precip-src', { type: 'geojson', data: { type: 'FeatureCollection', features } as any })
      map.addLayer({
        id: 'precip-circles',
        type: 'circle',
        source: 'precip-src',
        paint: {
          'circle-radius': ['get', 'r'],
          'circle-color': '#38bdf8',
          'circle-opacity': 0.25,
          'circle-stroke-color': '#38bdf8',
          'circle-stroke-width': 0.8,
          'circle-stroke-opacity': 0.5,
        },
      })
    }
  }, [selectedGeometry, showModelLayer, showWindLayer, showPrecipLayer, showVaacLayer, mapReady])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f1418] text-xs text-muted-foreground">
          Memuat peta OpenStreetMap...
        </div>
      )}
    </div>
  )
}
