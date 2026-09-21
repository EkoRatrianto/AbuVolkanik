'use client'

import { useMemo } from 'react'
import { Wind, ArrowDown, ArrowUp, Info } from 'lucide-react'
import type { WindProfileData, WindLevel } from './types'

export function WindProfile({ data }: { data: WindProfileData | null }) {
  if (!data) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
        Pilih kejadian untuk melihat profil angin multilapis.
      </div>
    )
  }

  const summitM = data.volcano.summitMAsl
  // Tinggi maksimum untuk skala (kolom abu maksimum ~ 1,5× summit atau 10km)
  const topMaxM = Math.max(10000, summitM * 2, ...data.levels.map((l) => l.zMAsl))

  // Layout SVG
  const W = 360
  const H = 380
  const padL = 56
  const padR = 16
  const padT = 28
  const padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  // Fungsi skala: altitude (m ASL) → y
  const yOf = (mAsl: number) => padT + (1 - mAsl / topMaxM) * plotH
  // Fungsi skala: kecepatan → x
  const maxSpeed = Math.max(...data.levels.map((l) => l.speedMs), 15)
  const xOf = (speed: number) => padL + (speed / maxSpeed) * plotW

  const summitY = yOf(summitM)
  const terrainLineY = summitY

  // Sembunyikan level di bawah tanah (sesuai dokumen §9.2 aturan 2 & 5)
  const visibleLevels = data.levels
  const hiddenCount = data.hiddenBelowGround.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-sky-300" />
          <h3 className="text-sm font-semibold">Profil Angin Multilapis</h3>
        </div>
        <span className="rounded border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
          {data.label}
        </span>
      </div>

      <div className="rounded-md border border-border bg-muted/20 p-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span><strong className="text-foreground">{data.volcano.name}</strong></span>
          <span>Puncak: <span className="font-mono text-foreground">{summitM.toLocaleString('id-ID')} m ASL</span></span>
          <span>Model: <span className="text-foreground">{data.metProvider}</span></span>
          {data.metCycleAt && (
            <span>Siklus: <span className="font-mono text-foreground">{new Date(data.metCycleAt).toISOString().slice(0, 16).replace('T', ' ')}Z</span></span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[340px]" role="img" aria-label="Profil angin vertikal">
          <defs>
            <marker id="wind-arrow-head" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill="currentColor" />
            </marker>
          </defs>

          {/* Sumbu Y (altitude) */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#475569" strokeWidth="1" />
          {/* Sumbu X (speed) */}
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#475569" strokeWidth="1" />

          {/* Gridlines altitude */}
          {[0, 2000, 4000, 6000, 8000, 10000].filter((m) => m <= topMaxM).map((m) => (
            <g key={m}>
              <line x1={padL} y1={yOf(m)} x2={padL + plotW} y2={yOf(m)} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,3" />
              <text x={padL - 6} y={yOf(m) + 3} fill="#94a3b8" fontSize="8" textAnchor="end" className="font-mono">
                {m / 1000}km
              </text>
            </g>
          ))}

          {/* Garis terrain (summit) */}
          <line x1={padL} y1={terrainLineY} x2={padL + plotW} y2={terrainLineY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={padL + plotW - 4} y={terrainLineY - 3} fill="#f59e0b" fontSize="8" textAnchor="end" className="font-mono">
            puncak {summitM} m
          </text>
          {/* Area bawah tanah */}
          <rect x={padL} y={terrainLineY} width={plotW} height={padT + plotH - terrainLineY} fill="#1e293b" fillOpacity="0.4" />
          <text x={padL + plotW / 2} y={padT + plotH - 8} fill="#64748b" fontSize="8" textAnchor="middle">
            {hiddenCount > 0 ? `${hiddenCount} level di bawah permukaan disembunyikan` : 'permukaan tanah'}
          </text>

          {/* Label sumbu X */}
          <text x={padL + plotW / 2} y={H - 6} fill="#94a3b8" fontSize="8" textAnchor="middle">
            kecepatan angin (m/s) →
          </text>
          {[0, Math.round(maxSpeed / 2), Math.round(maxSpeed)].map((s) => (
            <text key={s} x={xOf(s)} y={padT + plotH + 10} fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-mono">
              {s}
            </text>
          ))}

          {/* Level angin + panah */}
          {visibleLevels.map((lvl, i) => {
            const y = yOf(lvl.zMAsl)
            const x = xOf(lvl.speedMs)
            // Panah arah gerak: moveToDeg (0=N=atas, 90=E=kanan)
            const rad = (lvl.moveToDeg * Math.PI) / 180
            const arrowLen = 14
            const dx = Math.sin(rad) * arrowLen
            const dy = -Math.cos(rad) * arrowLen
            // Warna berdasarkan level (rendah=biru, menengah=hijau, tinggi=ungu) sesuai dokumen
            const levelColor = lvl.pressureHpa >= 700 ? '#38bdf8' : lvl.pressureHpa >= 500 ? '#4ade80' : '#c084fc'
            return (
              <g key={i}>
                {/* Titik level */}
                <circle cx={x} cy={y} r="2.5" fill={levelColor} stroke="#0f1418" strokeWidth="0.5" />
                {/* Garis ke sumbu Y */}
                <line x1={padL} y1={y} x2={x} y2={y} stroke={levelColor} strokeWidth="0.6" strokeOpacity="0.4" />
                {/* Panah arah gerak */}
                <g transform={`translate(${x + 6}, ${y})`} style={{ color: levelColor }}>
                  <line x1="0" y1="0" x2={dx} y2={dy} stroke={levelColor} strokeWidth="1.4" markerEnd="url(#wind-arrow-head)" />
                </g>
                {/* Label: hPa, m ASL, m AGL */}
                <text x={padL + plotW - 4} y={y - 3} fill="#e2e8f0" fontSize="7.5" textAnchor="end" className="font-mono">
                  {lvl.pressureHpa}hPa · {Math.round(lvl.zMAsl)}m · +{Math.round(lvl.aglM)}m AGL
                </text>
                <text x={padL + plotW - 4} y={y + 6} fill="#94a3b8" fontSize="7" textAnchor="end" className="font-mono">
                  {lvl.speedMs.toFixed(1)} m/s → {Math.round(lvl.moveToDeg)}°
                </text>
                {/* Presipitasi indikator */}
                {lvl.precipMm > 0 && (
                  <circle cx={padL - 12} cy={y} r="2" fill="#38bdf8" fillOpacity="0.6" />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Penjelasan arah */}
      <div className="rounded-md border border-border bg-muted/20 p-2.5 space-y-1.5 text-[10px] text-muted-foreground">
        <div className="flex items-start gap-1.5">
          <Info className="h-3 w-3 text-sky-300 mt-0.5 shrink-0" />
          <p>
            <strong className="text-foreground">Arah gerak udara</strong> = arah angin &ldquo;dari&rdquo; + 180°.
            Panah menunjukkan arah <strong className="text-foreground">menuju</strong> pergerakan udara.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-4.5">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400" /> level rendah (≥700 hPa)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> level menengah (≥500 hPa)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-400" /> level tinggi (&lt;500 hPa)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400/60" /> presipitasi (model)
          </span>
        </div>
        <p className="pl-4.5 italic text-[9px]">{data.note}</p>
      </div>
    </div>
  )
}
