'use client'

import { Wind, Info, Navigation } from 'lucide-react'
import { compassName } from '@/lib/geo'
import type { WindProfileData, WindLevel } from './types'

// Kompas 16-arah untuk presisi (singkatan)
const COMPASS_16 = [
  'U', 'U·TL', 'TL', 'TL·T', 'T', 'T·TG', 'TG', 'TG·S', 'S',
  'S·BD', 'BD', 'BD·B', 'B', 'B·BL', 'BL', 'BL·U',
]
function compass16(deg: number): string {
  const idx = Math.round(deg / 22.5) % 16
  return COMPASS_16[idx]
}

// Warna level: rendah=biru, menengah=hijau, tinggi=ungu (sesuai dokumen §5.3)
function levelColor(pressureHpa: number): string {
  if (pressureHpa >= 700) return '#38bdf8'
  if (pressureHpa >= 500) return '#4ade80'
  return '#c084fc'
}

// Warna kecepatan untuk bar
function speedColor(speed: number): string {
  if (speed < 4) return '#64748b'
  if (speed < 8) return '#fbbf24'
  if (speed < 14) return '#fb923c'
  return '#f87171'
}

export function WindProfile({ data }: { data: WindProfileData | null }) {
  if (!data) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
        Pilih kejadian untuk melihat profil angin multilapis.
      </div>
    )
  }

  const summitM = data.volcano.summitMAsl
  const visibleLevels = data.levels
  const hiddenCount = data.hiddenBelowGround.length
  const maxSpeed = Math.max(...visibleLevels.map((l) => l.speedMs), 15)

  // Konstanta layout SVG
  const W = 420
  const rowH = 42
  const headerH = 60 // kompas rose + judul
  const footerH = 16
  const H = headerH + visibleLevels.length * rowH + footerH
  const padL = 8
  const padR = 8

  // Kolom layout:
  // [hPa label] [altitude] [kompas rose mini per row + panah BESAR] [kecepatan bar + angka]
  const colHp = padL
  const colHpW = 42
  const colAlt = colHp + colHpW + 4
  const colAltW = 54
  // Kolom panah: pusat kompas di tengah, panah besar jelas
  const colArrow = colAlt + colAltW + 6
  const colArrowW = 150
  const arrowCx = colArrow + colArrowW / 2
  // Kolom kecepatan
  const colSpeed = colArrow + colArrowW + 6
  const colSpeedW = W - colSpeed - padR

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
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]" role="img" aria-label="Profil angin vertikal multilapis — panah menunjukkan arah gerak udara">
          {/* ===== HEADER: Kompas rose acuan + label kolom ===== */}
          <g>
            {/* Kompas rose kecil di header (acuan arah) */}
            {(() => {
              const cx = arrowCx
              const cy = headerH / 2
              const r = 22
              const labels = [
                { deg: 0, label: 'U', dx: 0, dy: -r - 3 },
                { deg: 90, label: 'T', dx: r + 3, dy: 0 },
                { deg: 180, label: 'S', dx: 0, dy: r + 3 },
                { deg: 270, label: 'B', dx: -r - 3, dy: 0 },
              ]
              return (
                <g>
                  <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
                  {/* garis N-S, E-B */}
                  <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#334155" strokeWidth="0.5" />
                  <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#334155" strokeWidth="0.5" />
                  {/* panah utara */}
                  <polygon
                    points={`${cx},${cy - r} ${cx - 3},${cy - r + 6} ${cx + 3},${cy - r + 6}`}
                    fill="#ef4444"
                  />
                  {labels.map((l) => (
                    <text key={l.label} x={cx + l.dx} y={cy + l.dy + 3} fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-mono font-semibold">
                      {l.label}
                    </text>
                  ))}
                  <text x={cx} y={cy + r + 14} fill="#64748b" fontSize="7" textAnchor="middle">
                    acuan arah
                  </text>
                </g>
              )
            })()}
            {/* Label kolom kiri */}
            <text x={colHp + colHpW / 2} y={headerH - 6} fill="#64748b" fontSize="8" textAnchor="middle" className="font-semibold">
              TEKANAN
            </text>
            <text x={colAlt + colAltW / 2} y={headerH - 6} fill="#64748b" fontSize="8" textAnchor="middle" className="font-semibold">
              KETINGGIAN
            </text>
            <text x={colSpeed + colSpeedW / 2} y={headerH - 6} fill="#64748b" fontSize="8" textAnchor="middle" className="font-semibold">
              KECEPATAN
            </text>
          </g>

          {/* Garis pemisah header */}
          <line x1={padL} y1={headerH} x2={W - padR} y2={headerH} stroke="#334155" strokeWidth="0.6" />

          {/* ===== BARIS PER LEVEL ===== */}
          {visibleLevels.map((lvl, i) => {
            const y = headerH + i * rowH + rowH / 2
            const color = levelColor(lvl.pressureHpa)
            const spdColor = speedColor(lvl.speedMs)

            // Pusat panah kompas di tengah kolom arrow
            const acx = arrowCx
            const acy = y
            const arrowR = 32 // jari-jari lingkaran kompas
            // arah gerak: moveToDeg (0=N=atas, 90=E=kanan)
            const rad = (lvl.moveToDeg * Math.PI) / 180
            const arrowLen = arrowR - 4
            // ujung panah (B)
            const bx = acx + Math.sin(rad) * arrowLen
            const by = acy - Math.cos(rad) * arrowLen
            // ekor panah (A) — mundur setengah
            const ax = acx - Math.sin(rad) * (arrowLen * 0.35)
            const ay = acy + Math.cos(rad) * (arrowLen * 0.35)
            // sisi kepala panah
            const headLen = 7
            const headAng = (28 * Math.PI) / 180
            const leftRad = rad + Math.PI - headAng
            const rightRad = rad + Math.PI + headAng
            const lx = bx + Math.sin(leftRad) * headLen
            const ly = by - Math.cos(leftRad) * headLen
            const rx = bx + Math.sin(rightRad) * headLen
            const ry = by - Math.cos(rightRad) * headLen

            // Label kompas (singkatan arah gerak)
            const comp16 = compass16(lvl.moveToDeg)
            const compFull = compassName(lvl.moveToDeg)

            // Bar kecepatan
            const speedBarW = (lvl.speedMs / maxSpeed) * (colSpeedW - 30)

            return (
              <g key={i}>
                {/* Background baris (zebra) */}
                {i % 2 === 1 && (
                  <rect x={padL} y={y - rowH / 2} width={W - padL - padR} height={rowH} fill="#1e293b" fillOpacity="0.3" />
                )}

                {/* Kolom tekanan */}
                <text x={colHp + colHpW / 2} y={y - 2} fill={color} fontSize="11" textAnchor="middle" className="font-mono font-bold">
                  {lvl.pressureHpa}
                </text>
                <text x={colHp + colHpW / 2} y={y + 8} fill="#64748b" fontSize="7" textAnchor="middle">
                  hPa
                </text>

                {/* Kolom ketinggian */}
                <text x={colAlt + colAltW / 2} y={y - 2} fill="#e2e8f0" fontSize="9" textAnchor="middle" className="font-mono">
                  {Math.round(lvl.zMAsl).toLocaleString('id-ID')} m
                </text>
                <text x={colAlt + colAltW / 2} y={y + 8} fill="#64748b" fontSize="7" textAnchor="middle" className="font-mono">
                  ASL · +{Math.round(lvl.aglM)}m AGL
                </text>

                {/* Kolom panah arah — lingkaran kompas + panah besar */}
                <g>
                  {/* Lingkaran kompas latar */}
                  <circle cx={acx} cy={acy} r={arrowR} fill="#0f172a" fillOpacity="0.5" stroke="#334155" strokeWidth="0.6" />
                  {/* Tick N/S/E/B pada lingkaran */}
                  <text x={acx} y={acy - arrowR + 7} fill="#475569" fontSize="6" textAnchor="middle" className="font-mono">U</text>
                  <text x={acx + arrowR - 4} y={acy + 3} fill="#475569" fontSize="6" textAnchor="end" className="font-mono">T</text>
                  <text x={acx} y={acy + arrowR - 1} fill="#475569" fontSize="6" textAnchor="middle" className="font-mono">S</text>
                  <text x={acx - arrowR + 4} y={acy + 3} fill="#475569" fontSize="6" textAnchor="start" className="font-mono">B</text>

                  {/* Shaft panah (A→B) */}
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth="2.8" strokeLinecap="round" />
                  {/* Kepala panah (2 sisi) */}
                  <line x1={lx} y1={ly} x2={bx} y2={by} stroke={color} strokeWidth="2.8" strokeLinecap="round" />
                  <line x1={rx} y1={ry} x2={bx} y2={by} stroke={color} strokeWidth="2.8" strokeLinecap="round" />

                  {/* Titik ekor (penanda asal) */}
                  <circle cx={ax} cy={ay} r="2" fill={color} />

                  {/* Label arah di bawah lingkaran: singkatan + derajat */}
                  <text x={acx} y={acy + arrowR + 10} fill={color} fontSize="8.5" textAnchor="middle" className="font-mono font-bold">
                    {compFull} ({comp16})
                  </text>
                  <text x={acx} y={acy + arrowR + 19} fill="#64748b" fontSize="7" textAnchor="middle" className="font-mono">
                    gerak ke {Math.round(lvl.moveToDeg)}°
                  </text>
                </g>

                {/* Kolom kecepatan: bar + angka */}
                <g>
                  <rect x={colSpeed} y={y - 6} width={colSpeedW - 4} height={12} rx="2" fill="#1e293b" />
                  <rect x={colSpeed} y={y - 6} width={speedBarW} height={12} rx="2" fill={spdColor} fillOpacity="0.85" />
                  <text x={colSpeed + 4} y={y + 3} fill="#0f1418" fontSize="8.5" className="font-mono font-bold">
                    {lvl.speedMs.toFixed(1)} m/s
                  </text>
                  {/* Presipitasi indikator */}
                  {lvl.precipMm > 0 && (
                    <g>
                      <circle cx={colSpeed + colSpeedW - 10} cy={y} r="4" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x={colSpeed + colSpeedW - 10} y={y + 2.5} fill="#f1f5f9" fontSize="6" textAnchor="middle" className="font-mono font-bold">
                        {lvl.precipMm.toFixed(1)}
                      </text>
                    </g>
                  )}
                </g>

                {/* Garis pemisah baris */}
                <line x1={padL} y1={headerH + (i + 1) * rowH} x2={W - padR} y2={headerH + (i + 1) * rowH} stroke="#1e293b" strokeWidth="0.4" />
              </g>
            )
          })}

          {/* Footer note */}
          <text x={W / 2} y={H - 4} fill="#475569" fontSize="7" textAnchor="middle">
            Panah = arah GERAK udara (menuju). Level bawah tanah disembunyikan.
          </text>
        </svg>
      </div>

      {/* Penjelasan arah — lebih eksplisit */}
      <div className="rounded-md border border-border bg-muted/20 p-2.5 space-y-2 text-[10px] text-muted-foreground">
        <div className="flex items-start gap-1.5">
          <Navigation className="h-3 w-3 text-sky-300 mt-0.5 shrink-0" />
          <p>
            <strong className="text-foreground">Cara baca:</strong> Panah pada setiap level menunjukkan arah{' '}
            <strong className="text-sky-300">GERAK udara (menuju)</strong>. Contoh: panah ke kanan = angin bergerak ke{' '}
            <strong className="text-foreground">Timur</strong>. Titik di pangkal panah = titik asal.
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <Info className="h-3 w-3 text-sky-300 mt-0.5 shrink-0" />
          <p>
            <strong className="text-foreground">Konversi:</strong> arah gerak = arah angin &ldquo;dari&rdquo; + 180°.
            Meteorologis menyatakan arah <em>dari mana</em> angin bertiup; panah ini menunjukkan{' '}
            <em>ke mana</em> udara bergerak.
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
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400/60" /> presipitasi (mm)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-4.5">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm bg-slate-500" /> lemah (&lt;4 m/s)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm bg-amber-400" /> sedang (4–8 m/s)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm bg-orange-400" /> kuat (8–14 m/s)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm bg-red-400" /> sangat kuat (≥14 m/s)
          </span>
        </div>
        <p className="pl-4.5 italic text-[9px]">{data.note}</p>
      </div>
    </div>
  )
}
