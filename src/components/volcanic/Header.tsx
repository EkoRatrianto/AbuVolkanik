'use client'

import { Mountain, Activity, Radio, ShieldAlert, Clock } from 'lucide-react'

export function Header({
  activeEventCount,
  lastUpdated,
}: {
  activeEventCount: number
  lastUpdated: string
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
            <Mountain className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-semibold leading-tight truncate">
              Pemantauan Abu Vulkanik Indonesia
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
              Platform fusi bukti — INDIKASI MODEL, bukan peringatan resmi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1">
            <Activity className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs font-medium">{activeEventCount} kejadian aktif</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Sumber: PVMBG · BMKG · VAAC · NOAA</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{lastUpdated}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300 hidden sm:inline">Indikasi Model</span>
          </div>
        </div>
      </div>
    </header>
  )
}
