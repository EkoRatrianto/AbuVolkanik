'use client'

import { useMemo, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Wind, CloudRain, Gauge, Info, ArrowDown, ArrowUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface WindFieldData {
  level: number
  levelMeta: { hpa: number; mAsl: number; band: string; desc: string }
  metProvider: string
  label: string
  note: string
  bbox: { minLng: number; maxLng: number; minLat: number; maxLat: number }
  cols: number
  rows: number
  cells: Array<{
    lng: number
    lat: number
    windFromDeg: number
    speedMs: number
    precipMm: number
    cloudCover: number
    isConvective: boolean
  }>
}

const LEVELS = [1000, 925, 850, 700, 500, 300]

export function WindWeatherMap({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [level, setLevel] = useState(850)
  const [showRain, setShowRain] = useState(true)
  const [showWind, setShowWind] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['wind-field', level],
    queryFn: async () => {
      const r = await fetch(`/api/wind-field?level=${level}`)
      if (!r.ok) throw new Error('wind-field failed')
      return r.json() as Promise<WindFieldData>
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] p-0 flex flex-col bg-background sm:max-w-none">
        <SheetHeader className="border-b border-border px-4 py-3 text-left space-y-1">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-sky-300" />
            <SheetTitle className="text-base">Peta Arah Angin & Cuaca Nasional</SheetTitle>
            <span className="ml-auto rounded border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
              PRAKIRAAN METEOROLOGI
            </span>
          </div>
          <SheetDescription className="text-xs">
            Grid arah angin & cuaca per pressure level. BUKAN observasi aktual — rujuk BMKG/NOAA GFS otoritatif.
          </SheetDescription>
        </SheetHeader>

        {/* Kontrol */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground mr-1">Pressure level:</span>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded border px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                  level === l
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {l} hPa
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant={showWind ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => setShowWind((v) => !v)}
            >
              <Wind className="h-3.5 w-3.5 mr-1" /> Angin
            </Button>
            <Button
              size="sm"
              variant={showRain ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => setShowRain((v) => !v)}
            >
              <CloudRain className="h-3.5 w-3.5 mr-1" /> Presipitasi
            </Button>
          </div>
        </div>

        {isLoading || !data ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Memuat grid angin & cuaca...
          </div>
        ) : (
          <ScrollArea className="flex-1 scroll-volcanic">
            <div className="p-4 space-y-4">
              {/* Info bar */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border bg-muted/20 p-2.5 text-[10px]">
                <span><strong className="text-foreground">{data.levelMeta.hpa} hPa</strong> · {data.levelMeta.band} · ~{data.levelMeta.mAsl.toLocaleString('id-ID')} m ASL</span>
                <span className="text-muted-foreground">{data.levelMeta.desc}</span>
                <span className="text-muted-foreground ml-auto">{data.metProvider}</span>
              </div>

              {/* SVG grid */}
              <WindFieldSVG data={data} showWind={showWind} showRain={showRain} />

              {/* Legenda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Legenda Angin</h4>
                  <div className="flex items-center gap-2 text-[10px]">
                    <svg width="36" height="8" className="shrink-0">
                      <line x1="2" y1="4" x2="30" y2="4" stroke="#fbbf24" strokeWidth="2.2" />
                      <polygon points="30,4 26,2 26,6" fill="#fbbf24" />
                    </svg>
                    <span className="text-muted-foreground">panah = arah gerak udara (menuju)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="inline-block h-2 w-6 rounded" style={{ background: 'linear-gradient(to right,#fde68a,#f59e0b,#dc2626)' }} />
                    <span className="text-muted-foreground">kecepatan: lemah → kuat (m/s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <ArrowUp className="h-3 w-3 text-amber-300" />
                    <span className="text-muted-foreground">angin &ldquo;dari&rdquo; + 180° = arah gerak</span>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Legenda Cuaca</h4>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="inline-block h-3 w-3 rounded-full bg-sky-400/30 border border-sky-400" />
                    <span className="text-muted-foreground">presipitasi ringan (&lt;2mm)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="inline-block h-3 w-3 rounded-full bg-sky-500/50 border border-sky-500" />
                    <span className="text-muted-foreground">presipitasi sedang (2–4mm)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="inline-block h-3 w-3 rounded-full bg-indigo-500/70 border border-indigo-400" />
                    <span className="text-muted-foreground">konveksi tinggi (&gt;4mm)</span>
                  </div>
                </div>
              </div>

              {/* Catatan */}
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[10px] text-muted-foreground">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">{data.note}</p>
                </div>
                <p className="mt-1.5 pl-4.5 italic text-[9px]">
                  Pola umum: trade wind easterlies di selatan equator, monsoon barat daya di utara,
                  subtropical jet westerly di level tinggi selatan. ITCZ cluster di sekitar khatulistiwa.
                </p>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}

function WindFieldSVG({ data, showWind, showRain }: { data: WindFieldData; showWind: boolean; showRain: boolean }) {
  const W = 920
  const H = 440
  const padL = 36
  const padR = 12
  const padT = 18
  const padB = 36
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const { minLng, maxLng, minLat, maxLat } = data.bbox
  const xOf = (lng: number) => padL + ((lng - minLng) / (maxLng - minLng)) * plotW
  const yOf = (lat: number) => padT + ((maxLat - lat) / (maxLat - minLat)) * plotH

  const maxSpeed = useMemo(() => Math.max(...data.cells.map((c) => c.speedMs), 20), [data])

  const speedColor = (s: number) => {
    // lemah→kuat: krem → oranye → merah
    const t = Math.min(1, s / Math.max(maxSpeed, 15))
    if (t < 0.33) return '#fde68a'
    if (t < 0.66) return '#f59e0b'
    return '#dc2626'
  }

  return (
    <div className="rounded-md border border-border bg-[#0a1014] overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Grid arah angin dan cuaca Indonesia">
        <defs>
          <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="#0a1014" />
        <rect x={padL} y={padT} width={plotW} height={plotH} fill="url(#bg-grid)" />

        {/* Sumbu & label */}
        {[100, 110, 120, 130, 140].map((lng) => {
          if (lng > maxLng) return null
          return (
            <g key={`lng-${lng}`}>
              <line x1={xOf(lng)} y1={padT} x2={xOf(lng)} y2={padT + plotH} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,3" />
              <text x={xOf(lng)} y={padT + plotH + 14} fill="#64748b" fontSize="9" textAnchor="middle" className="font-mono">{lng}°E</text>
            </g>
          )
        })}
        {[-10, -5, 0, 5].map((lat) => (
          <g key={`lat-${lat}`}>
            <line x1={padL} y1={yOf(lat)} x2={padL + plotW} y2={yOf(lat)} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,3" />
            <text x={padL - 4} y={yOf(lat) + 3} fill="#64748b" fontSize="9" textAnchor="end" className="font-mono">{lat}°</text>
          </g>
        ))}

        {/* Garis khatulistiwa */}
        <line x1={padL} y1={yOf(0)} x2={padL + plotW} y2={yOf(0)} stroke="#475569" strokeWidth="1" />
        <text x={padL + plotW - 4} y={yOf(0) - 3} fill="#64748b" fontSize="8" textAnchor="end" className="font-mono">EQUATOR 0°</text>

        {/* Presipitasi layer (bawah) */}
        {showRain && data.cells.map((c, i) => {
          if (c.precipMm < 0.1) return null
          const r = 4 + c.precipMm * 4
          const color = c.isConvective ? 'rgba(129, 140, 248, 0.7)' : c.precipMm > 2 ? 'rgba(14, 165, 233, 0.5)' : 'rgba(56, 189, 248, 0.3)'
          const stroke = c.isConvective ? '#818cf8' : c.precipMm > 2 ? '#0ea5e9' : '#38bdf8'
          return (
            <circle key={`p-${i}`} cx={xOf(c.lng)} cy={yOf(c.lat)} r={r} fill={color} stroke={stroke} strokeWidth="0.8" strokeOpacity="0.6" />
          )
        })}

        {/* Wind arrows */}
        {showWind && data.cells.map((c, i) => {
          const x = xOf(c.lng)
          const y = yOf(c.lat)
          const rad = (c.windFromDeg * Math.PI) / 180
          // arah gerak = windFrom + 180
          const moveRad = ((c.windFromDeg + 180) % 360) * Math.PI / 180
          const len = 10 + Math.min(22, c.speedMs * 1.6)
          const dx = Math.sin(moveRad) * len
          const dy = -Math.cos(moveRad) * len
          const color = speedColor(c.speedMs)
          return (
            <g key={`w-${i}`}>
              <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.92" />
              <polygon
                points={`${x + dx},${y + dy} ${x + dx - 4 * Math.cos(moveRad) - 2.5 * Math.sin(moveRad)},${y + dy + 4 * Math.sin(moveRad) - 2.5 * Math.cos(moveRad)} ${x + dx - 4 * Math.cos(moveRad) + 2.5 * Math.sin(moveRad)},${y + dy + 4 * Math.sin(moveRad) + 2.5 * Math.cos(moveRad)}`}
                fill={color}
              />
              <circle cx={x} cy={y} r="1" fill={color} opacity="0.5" />
            </g>
          )
        })}

        {/* Marker gunung api aktif (untuk konteks lokasi) */}
        {/* Semeru */}
        <g>
          <circle cx={xOf(112.922)} cy={yOf(-8.108)} r="4" fill="#fb923c" stroke="#0f1418" strokeWidth="1.5" />
          <text x={xOf(112.922) + 6} y={yOf(-8.108) + 3} fill="#fcd34d" fontSize="9" className="font-semibold">Semeru</text>
        </g>

        {/* Label bbox */}
        <text x={padL + 4} y={padT + 12} fill="#475569" fontSize="9" className="font-mono">INDONESIA · {data.levelMeta.hpa} hPa</text>
      </svg>
    </div>
  )
}
