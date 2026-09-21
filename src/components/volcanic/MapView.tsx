'use client'

import { useMemo, useState } from 'react'
import { INDONESIA_ISLANDS, project, INDONESIA_BBOX } from '@/lib/geo'
import type { EventListItem, AviationColor } from './types'

interface MapViewProps {
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
  // Footprint & trajectory untuk event terpilih
  selectedGeometry?: {
    polygons: Array<{
      geometry: any
      metric: string
      value: number
      nMembers: number
      nIntersect: number
      verticalBand: string
      validFrom: string
      validTo: string
    }>
    trajectories: Array<{
      geometry: any
      validFrom: string
      validTo: string
      verticalBand: string
    }>
    adminAreas?: Array<{
      name: string
      lat: number
      lng: number
      ratio: number
      isConfirmed: boolean
    }>
    windLevels?: Array<{
      pressureHpa: number
      zMAsl: number
      windFromDeg: number
      speedMs: number
      moveToDeg: number
    }>
    volcanoLat?: number
    volcanoLng?: number
  } | null
  showModelLayer: boolean
  showWindLayer: boolean
  showPrecipLayer: boolean
}

const COLOR_HEX: Record<AviationColor, string> = {
  GREEN: '#34d399',
  YELLOW: '#fcd34d',
  ORANGE: '#fb923c',
  RED: '#f87171',
}

export function MapView({
  volcanoes,
  events,
  selectedEventId,
  onSelectEvent,
  selectedGeometry,
  showModelLayer,
  showWindLayer,
  showPrecipLayer,
}: MapViewProps) {
  const [hover, setHover] = useState<{
    id: string
    name: string
    x: number
    y: number
    color: AviationColor
    eventCount: number
  } | null>(null)

  const W = 1000
  const H = 460

  // Set volcanoes yang punya event aktif (lebih menonjol)
  const activeVolcanoIds = useMemo(
    () => new Set(events.map((e) => e.volcano.id)),
    [events]
  )
  const eventByVolcano = useMemo(() => {
    const m = new Map<string, EventListItem>()
    for (const e of events) m.set(e.volcano.id, e)
    return m
  }, [events])

  // Convert island rings ke SVG path
  const islandPaths = useMemo(() => {
    return INDONESIA_ISLANDS.map((island) => ({
      name: island.name,
      paths: island.rings.map((ring) => {
        const pts = ring.map(([lng, lat]) => project(lng, lat, W, H))
        return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
      }),
    }))
  }, [])

  // Footprint polygon untuk event terpilih
  const footprintPolygons = useMemo(() => {
    if (!selectedGeometry?.polygons || !showModelLayer) return []
    return selectedGeometry.polygons.map((f) => {
      const coords = f.geometry.coordinates[0] as [number, number][]
      const pts = coords.map(([lng, lat]) => project(lng, lat, W, H))
      const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
      return { path, metric: f.metric, value: f.value, nMembers: f.nMembers, nIntersect: f.nIntersect, verticalBand: f.verticalBand }
    })
  }, [selectedGeometry, showModelLayer])

  const trajectories = useMemo(() => {
    if (!selectedGeometry?.trajectories || !showModelLayer) return []
    return selectedGeometry.trajectories.map((t) => {
      const coords = t.geometry.coordinates as [number, number][]
      const pts = coords.map(([lng, lat]) => project(lng, lat, W, H))
      const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
      return { path, verticalBand: t.verticalBand }
    })
  }, [selectedGeometry, showModelLayer])

  const adminAreas = useMemo(() => {
    if (!selectedGeometry?.adminAreas || !showModelLayer) return []
    return selectedGeometry.adminAreas.map((a) => ({
      ...a,
      pos: project(a.lng, a.lat, W, H),
    }))
  }, [selectedGeometry, showModelLayer])

  const windArrows = useMemo(() => {
    if (!selectedGeometry?.windLevels || !showWindLayer || !selectedGeometry.volcanoLat || !selectedGeometry.volcanoLng) return []
    const volcanoPos = project(selectedGeometry.volcanoLng, selectedGeometry.volcanoLat, W, H)
    // Tampilkan panah angin untuk 3 level (warna berbeda sesuai dokumen)
    // biru = level rendah, hijau = menengah, ungu = tinggi
    const levelColors = ['#38bdf8', '#4ade80', '#c084fc']
    const selectedLevels = [1, 3, 5] // ambil beberapa level
    return selectedGeometry.windLevels
      .filter((_, i) => selectedLevels.includes(i))
      .slice(0, 3)
      .map((level, idx) => {
        const arrowLen = 22 + level.speedMs * 1.6
        const rad = (level.moveToDeg * Math.PI) / 180
        // moveToDeg: arah gerak (ke mana). 0=utara (atas), 90=timur (kanan)
        const dx = Math.sin(rad) * arrowLen
        const dy = -Math.cos(rad) * arrowLen
        const offset = (idx - 1) * 14
        return {
          x1: volcanoPos.x + offset * 0.5,
          y1: volcanoPos.y - 18 - idx * 8,
          x2: volcanoPos.x + offset * 0.5 + dx,
          y2: volcanoPos.y - 18 - idx * 8 + dy,
          color: levelColors[idx % 3],
          pressureHpa: level.pressureHpa,
          speedMs: level.speedMs,
          moveToDeg: level.moveToDeg,
        }
      })
  }, [selectedGeometry, showWindLayer])

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Peta nasional pemantauan abu vulkanik Indonesia"
      >
        <defs>
          <pattern id="hatch-orange" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#fb923c" fillOpacity="0.12" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#fb923c" strokeWidth="1.4" strokeOpacity="0.7" />
          </pattern>
          <radialGradient id="marker-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        <rect x="0" y="0" width={W} height={H} fill="#0f1418" />

        {/* Laut — subtle grid */}
        <g opacity="0.08">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={(i * W) / 10} y1="0" x2={(i * W) / 10} y2={H} stroke="#64748b" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={(i * H) / 5} x2={W} y2={(i * H) / 5} stroke="#64748b" strokeWidth="0.5" />
          ))}
        </g>

        {/* Pulau Indonesia */}
        <g>
          {islandPaths.map((island) => (
            <g key={island.name}>
              {island.paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          ))}
        </g>

        {/* Precipitation layer (jika aktif) */}
        {showPrecipLayer && selectedGeometry?.windLevels && (
          <g opacity="0.35">
            {selectedGeometry.windLevels
              .filter((l) => l.precipMm > 0)
              .map((l, i) => {
                if (!selectedGeometry.volcanoLat || !selectedGeometry.volcanoLng) return null
                const pos = project(selectedGeometry.volcanoLng, selectedGeometry.volcanoLat, W, H)
                return (
                  <circle
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    r={50 + l.precipMm * 80}
                    fill="#38bdf8"
                    fillOpacity={0.12}
                    stroke="#38bdf8"
                    strokeOpacity={0.3}
                    strokeWidth="0.8"
                  />
                )
              })}
          </g>
        )}

        {/* Footprint model (orange hatched) */}
        {footprintPolygons.map((f, i) => (
          <g key={`fp-${i}`}>
            <path d={f.path} fill="url(#hatch-orange)" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="2,2" />
          </g>
        ))}

        {/* Trajectory screening (dashed, animated) */}
        {trajectories.map((t, i) => (
          <g key={`tr-${i}`}>
            <path
              d={t.path}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.6"
              strokeDasharray="6,4"
              className="dash-flow"
              opacity="0.85"
            />
          </g>
        ))}

        {/* Wind arrows (multi-level) */}
        {windArrows.map((a, i) => (
          <g key={`wind-${i}`}>
            <line
              x1={a.x1}
              y1={a.y1}
              x2={a.x2}
              y2={a.y2}
              stroke={a.color}
              strokeWidth="2"
              strokeLinecap="round"
              markerEnd={`url(#arrow-${i})`}
            />
            <polygon
              points={`${a.x2},${a.y2} ${a.x2 - 5},${a.y2 - 3} ${a.x2 - 5},${a.y2 + 3}`}
              fill={a.color}
              transform={`rotate(${a.moveToDeg} ${a.x2} ${a.y2})`}
            />
            <text x={a.x2 + 6} y={a.y2 - 4} fill={a.color} fontSize="8" className="font-mono">
              {a.pressureHpa}hPa
            </text>
          </g>
        ))}

        {/* Admin unit markers (potential areas) */}
        {adminAreas.map((a, i) => (
          <g key={`adm-${i}`}>
            <circle
              cx={a.pos.x}
              cy={a.pos.y}
              r={4 + a.ratio * 8}
              fill={a.isConfirmed ? '#dc2626' : '#f59e0b'}
              fillOpacity={0.6}
              stroke={a.isConfirmed ? '#dc2626' : '#f59e0b'}
              strokeWidth="1"
            />
            <text x={a.pos.x + 8} y={a.pos.y + 3} fill="#e2e8f0" fontSize="9" className="font-medium">
              {a.name.replace('Kab. ', '')}
            </text>
          </g>
        ))}

        {/* Volcano markers */}
        {volcanoes.map((v) => {
          const pos = project(v.lng, v.lat, W, H)
          const isActive = activeVolcanoIds.has(v.id)
          const isSelected = eventByVolcano.get(v.id)?.id === selectedEventId
          const color = COLOR_HEX[v.aviationColor]
          const r = isActive ? 5 : 3
          return (
            <g
              key={v.id}
              className="cursor-pointer"
              onClick={() => {
                const ev = eventByVolcano.get(v.id)
                if (ev) onSelectEvent(ev.id)
              }}
              onMouseEnter={() =>
                setHover({
                  id: v.id,
                  name: v.name,
                  x: pos.x,
                  y: pos.y,
                  color: v.aviationColor,
                  eventCount: v.eventCount,
                })
              }
              onMouseLeave={() => setHover(null)}
            >
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={r + 8} fill="url(#marker-glow)" className="pulse-marker" />
              )}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2,2" />
              )}
              <path
                d={`M${pos.x},${pos.y + r} L${pos.x - r * 0.7},${pos.y + r * 1.6} L${pos.x + r * 0.7},${pos.y + r * 1.6} Z`}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="0.6"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={color}
                stroke="#0f1418"
                strokeWidth="1"
                className={isActive ? 'pulse-marker' : ''}
              />
              {(isActive || isSelected) && (
                <text
                  x={pos.x}
                  y={pos.y - r - 4}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="9"
                  className="font-semibold"
                  style={{ pointerEvents: 'none' }}
                >
                  {v.name}
                </text>
              )}
            </g>
          )
        })}

        {/* Hover tooltip */}
        {hover && (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={hover.x + 8}
              y={hover.y - 28}
              width={hover.name.length * 6.5 + 70}
              height="32"
              rx="4"
              fill="#0f172a"
              stroke="#334155"
              opacity="0.95"
            />
            <circle cx={hover.x + 16} cy={hover.y - 12} r="3" fill={COLOR_HEX[hover.color]} />
            <text x={hover.x + 24} y={hover.y - 9} fill="#e2e8f0" fontSize="10" className="font-medium">
              {hover.name}
            </text>
            <text x={hover.x + 24} y={hover.y - 19} fill="#94a3b8" fontSize="8">
              {hover.eventCount > 0 ? `${hover.eventCount} kejadian aktif` : 'Tidak ada kejadian aktif'}
            </text>
          </g>
        )}

        {/* Label bbox edges */}
        <text x="8" y="14" fill="#64748b" fontSize="9" className="font-mono">
          {INDONESIA_BBOX.minLng}°E
        </text>
        <text x={W - 50} y="14" fill="#64748b" fontSize="9" className="font-mono">
          {INDONESIA_BBOX.maxLng}°E
        </text>
        <text x="8" y={H - 6} fill="#64748b" fontSize="9" className="font-mono">
          {INDONESIA_BBOX.minLat}°S
        </text>
        <text x="8" y="26" fill="#64748b" fontSize="9" className="font-mono">
          {INDONESIA_BBOX.maxLat}°N
        </text>
      </svg>
    </div>
  )
}
