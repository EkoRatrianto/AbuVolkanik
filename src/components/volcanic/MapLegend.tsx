'use client'

import { useState } from 'react'
import {
  Mountain,
  CloudRain,
  Wind,
  Route,
  Hexagon,
  Cloud,
  Navigation,
  ChevronUp,
  ChevronDown,
  X,
  Layers,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const LEVELS = [1000, 925, 850, 700, 500, 300]

interface MapLegendProps {
  showModelLayer: boolean
  showWindLayer: boolean
  showPrecipLayer: boolean
  showVaacLayer: boolean
  showWindGrid: boolean
  windGridLevel: number
  onToggleModel: () => void
  onToggleWind: () => void
  onTogglePrecip: () => void
  onToggleVaac: () => void
  onToggleWindGrid: () => void
  onChangeWindGridLevel: (level: number) => void
  // Fitur Up / Down & Open / Close
  isOpen?: boolean
  onToggleOpen?: () => void
  position?: 'top' | 'bottom'
  onTogglePosition?: () => void
  onOpenGuide?: () => void
}

export function MapLegend({
  showModelLayer,
  showWindLayer,
  showPrecipLayer,
  showVaacLayer,
  showWindGrid,
  windGridLevel,
  onToggleModel,
  onToggleWind,
  onTogglePrecip,
  onToggleVaac,
  onToggleWindGrid,
  onChangeWindGridLevel,
  isOpen = true,
  onToggleOpen,
  position = 'top',
  onTogglePosition,
  onOpenGuide,
}: MapLegendProps) {
  // State lipatan isi (fold up/down internal)
  const [isFolded, setIsFolded] = useState(false)

  const activeLayerCount = [
    showModelLayer,
    showWindLayer,
    showPrecipLayer,
    showVaacLayer,
    showWindGrid,
  ].filter(Boolean).length

  // Jika tertutup: tampilkan tombol mengambang ringkas
  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggleOpen}
        className="h-8 gap-1.5 shadow-lg border border-border bg-card/95 backdrop-blur text-xs font-medium hover:bg-card text-foreground"
        title="Buka Legenda & Layer Peta"
      >
        <Layers className="h-3.5 w-3.5 text-primary" />
        <span>Legenda &amp; Layer</span>
        <span className="rounded-full bg-primary/20 text-primary text-[10px] px-1.5 py-0.2 font-mono">
          {activeLayerCount}
        </span>
      </Button>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur shadow-xl overflow-hidden transition-all duration-200">
      {/* Header Legenda dengan kontrol Up/Down, Lipat, dan Tutup */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Legenda &amp; Layer
          </h3>
          <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
            {activeLayerCount} aktif
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Tombol Pindah Posisi Up / Down */}
          {onTogglePosition && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={onTogglePosition}
              title={
                position === 'top'
                  ? 'Pindahkan Legenda ke Bawah (Down)'
                  : 'Pindahkan Legenda ke Atas (Up)'
              }
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Tombol Lipat Up / Down */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFolded((f) => !f)}
            title={isFolded ? 'Buka detail legenda (Down)' : 'Lipat ringkas legenda (Up)'}
          >
            {isFolded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </Button>

          {/* Tombol Tutup (Close) */}
          {onToggleOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={onToggleOpen}
              title="Tutup Legenda"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Konten Legenda (bisa dilipat) */}
      {!isFolded && (
        <div className="p-3 space-y-2.5 text-xs max-h-[55vh] overflow-y-auto">
          {/* Volcano markers */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
            </div>
            <span className="text-muted-foreground">Gunung api (kode warna penerbangan)</span>
          </div>

          <div className="h-px bg-border" />

          {/* Wind grid overlay — toggle + selector level */}
          <div>
            <button
              onClick={onToggleWindGrid}
              className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors ${
                showWindGrid
                  ? 'bg-primary/10 text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Navigation
                className={`h-3.5 w-3.5 text-sky-300 ${showWindGrid ? '' : 'opacity-40'}`}
              />
              <span className="flex-1 text-xs leading-tight">
                <span className="inline-flex items-center gap-1.5">
                  <svg width="22" height="10" className="shrink-0">
                    <line x1="2" y1="5" x2="16" y2="5" stroke="#94a3b8" strokeWidth="1.4" />
                    <line x1="16" y1="5" x2="12" y2="3" stroke="#94a3b8" strokeWidth="1.4" />
                    <line x1="16" y1="5" x2="12" y2="7" stroke="#94a3b8" strokeWidth="1.4" />
                  </svg>
                  Panah arah angin (grid nasional)
                </span>
              </span>
              <span
                className={`text-[10px] font-mono ${
                  showWindGrid ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {showWindGrid ? 'ON' : 'OFF'}
              </span>
            </button>
            {showWindGrid && (
              <div className="mt-1.5 pl-6 pr-1">
                <div className="flex flex-wrap gap-1">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => onChangeWindGridLevel(l)}
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-mono transition-colors ${
                        windGridLevel === l
                          ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  Level: {windGridLevel} hPa &bull; warna = kecepatan (abu &rarr; merah)
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* VAAC Layer Toggle */}
          <LegendToggle
            active={showVaacLayer}
            onClick={onToggleVaac}
            icon={<Cloud className="h-3.5 w-3.5 text-fuchsia-400" />}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-4 border border-fuchsia-400 bg-fuchsia-400/15" />
              VAAC advisory abu atmosfer (multi FL)
            </span>
          </LegendToggle>

          {/* Footprint Model Toggle */}
          <LegendToggle
            active={showModelLayer}
            onClick={onToggleModel}
            icon={<Hexagon className="h-3.5 w-3.5 text-orange-400" />}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-4 border border-orange-400/70 bg-orange-400/15"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(251,146,60,0.5) 3px, rgba(251,146,60,0.5) 5px)',
                }}
              />
              Footprint model (indikasi)
            </span>
          </LegendToggle>

          {/* Trajectory screening */}
          <LegendToggle
            active={showModelLayer}
            onClick={onToggleModel}
            icon={<Route className="h-3.5 w-3.5 text-amber-300" />}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0 border-t-2 border-dashed border-amber-300 w-5" />
              Trajektori screening
            </span>
          </LegendToggle>

          {/* Profil angin vertikal event */}
          <LegendToggle
            active={showWindLayer}
            onClick={onToggleWind}
            icon={<Wind className="h-3.5 w-3.5 text-sky-300" />}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="text-sky-400">&rarr;</span>
              <span className="text-emerald-400">&rarr;</span>
              <span className="text-purple-400">&rarr;</span>
              Profil angin multilapis (event)
            </span>
          </LegendToggle>

          {/* Presipitasi */}
          <LegendToggle
            active={showPrecipLayer}
            onClick={onTogglePrecip}
            icon={<CloudRain className="h-3.5 w-3.5 text-sky-400" />}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-sky-400/30 border border-sky-400/50" />
              Presipitasi (model)
            </span>
          </LegendToggle>

          <div className="h-px bg-border" />

          {/* Penjelasan simbol tambahan */}
          <div className="space-y-1.5 text-[11px] text-muted-foreground pt-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/70 border border-red-500" />
              <span>Jatuhan abu permukaan terkonfirmasi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-fuchsia-500/30 border border-fuchsia-500" />
              <span>Poligon abu atmosfer / advisory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-500/30 border border-stone-500" />
              <span>Data kedaluwarsa / sumber tidak sehat</span>
            </div>
          </div>

          {/* Tombol Panduan Cepat di Bawah Legenda */}
          {onOpenGuide && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 gap-1.5"
                onClick={onOpenGuide}
              >
                <BookOpen className="h-3.5 w-3.5" /> Panduan Membaca Peta
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LegendToggle({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors ${
        active
          ? 'bg-primary/10 text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/50'
      }`}
    >
      <span className={active ? '' : 'opacity-40'}>{icon}</span>
      <span className="flex-1 text-xs leading-tight">{children}</span>
      <span
        className={`text-[10px] font-mono ${active ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {active ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}
