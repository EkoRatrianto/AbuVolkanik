'use client'

import { ShieldAlert, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/95 backdrop-blur">
      <div className="px-4 py-3 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[10px] md:text-[11px] leading-relaxed text-muted-foreground max-w-3xl">
              <strong className="text-foreground">Status:</strong> Rancangan MVP — bukan sistem operasional
              atau peringatan resmi. Sumber resmi:{' '}
              <a href="https://magma.esdm.go.id/vona" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                PVMBG MAGMA <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {', '}
              <a href="https://data.bmkg.go.id/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                BMKG <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {', '}
              <a href="https://www.bom.gov.au/aviation/volcanic-ash/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                VAAC Darwin <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {', '}
              <a href="https://nomads.ncep.noaa.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                NOAA NOMADS <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {'. '}
              Keputusan resmi ada pada otoritas setempat.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[10px] text-muted-foreground">
            <span className="font-mono">v1.0-rancangan</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Sumber asli wajib dirujuk sebelum tindakan</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
