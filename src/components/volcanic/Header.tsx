'use client'

import { Mountain, Activity, Radio, ShieldAlert, Clock, BookOpen, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header({
  activeEventCount,
  lastUpdated,
  onOpenGuide,
  onOpenSources,
}: {
  activeEventCount: number
  lastUpdated: string
  onOpenGuide?: () => void
  onOpenSources?: () => void
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

        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          {/* Tombol Informasi Jenis & Sumber Data */}
          {onOpenSources && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSources}
              className="h-8 text-xs px-2.5 gap-1.5 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium shadow-xs"
              title="Informasi Deskriptif Jenis dan Sumber Data yang Digunakan"
            >
              <Database className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sumber &amp; Jenis Data</span>
              <span className="md:hidden">Sumber Data</span>
            </Button>
          )}

          {/* Tombol Panduan Penggunaan untuk Orang Awam */}
          {onOpenGuide && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenGuide}
              className="h-8 text-xs px-2.5 gap-1.5 border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-medium shadow-xs"
              title="Buka Panduan Penggunaan Aplikasi (Bahasa Sederhana)"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Panduan Pengguna</span>
              <span className="sm:hidden">Panduan</span>
            </Button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1">
            <Activity className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs font-medium">{activeEventCount} kejadian aktif</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Sumber: PVMBG · BMKG · VAAC</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{lastUpdated}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Indikasi Model</span>
          </div>
        </div>
      </div>
    </header>
  )
}
