'use client'

import { useEffect, useRef } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Clock,
  Server,
  ShieldCheck,
  ShieldQuestion,
  Database,
} from 'lucide-react'
import type { SourceHealthItem } from './types'

const HEALTH_META = {
  green: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', label: 'Sehat' },
  yellow: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', label: 'Perhatian' },
  red: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', label: 'Bermasalah' },
} as const

export function DataHealth({
  open,
  onOpenChange,
  data,
  loading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: { summary: any; sources: SourceHealthItem[] } | null
  loading: boolean
}) {
  const summary = data?.summary
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fokuskan scroll container saat sheet terbuka & data selesai dimuat.
  useEffect(() => {
    if (open && !loading && summary) {
      const t = setTimeout(() => {
        scrollRef.current?.focus({ preventScroll: true })
      }, 120)
      return () => clearTimeout(t)
    }
  }, [open, loading, summary])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md lg:max-w-lg p-0 flex flex-col bg-background">
        <SheetHeader className="border-b border-border px-4 py-3 text-left space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <SheetTitle className="text-base">Kesehatan Sumber Data</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Heartbeat konektor, umur data, status legal, dan fallback. Feed sah tanpa alert tetap sehat —
            feed diam ≠ tidak ada kejadian.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Memeriksa konektor...
          </div>
        ) : summary && data ? (
          <div
            ref={scrollRef}
            role="region"
            aria-label="Konten kesehatan sumber"
            tabIndex={0}
            className="scroll-volcanic flex-1 overflow-y-auto outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          >
            <div className="p-4 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-2">
                <SummaryCard icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" label="Sehat" value={summary.green} />
                <SummaryCard icon={AlertTriangle} color="text-amber-400" bg="bg-amber-500/10" label="Perhatian" value={summary.yellow} />
                <SummaryCard icon={XCircle} color="text-red-400" bg="bg-red-500/10" label="Bermasalah" value={summary.red} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-card/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" /> Legal Disetujui
                  </div>
                  <div className="text-lg font-semibold text-foreground">{summary.legalApproved}/{summary.total}</div>
                </div>
                <div className="rounded-lg border border-border bg-card/40 p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                    <ShieldQuestion className="h-3 w-3 text-amber-400" /> Legal Menunggu
                  </div>
                  <div className="text-lg font-semibold text-foreground">{summary.legalPending}/{summary.total}</div>
                </div>
              </div>

              <Separator />

              {/* Daftar sumber */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Konektor Sumber</h3>
                {data.sources.map((s) => {
                  const meta = HEALTH_META[s.health]
                  const Icon = meta.icon
                  return (
                    <div key={s.sourceId} className={`rounded-lg border ${meta.border} ${meta.bg} p-2.5 space-y-1.5`}>
                      <div className="flex items-start gap-2">
                        <Icon className={`h-4 w-4 ${meta.color} mt-0.5 shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">{s.sourceId}</span>
                            <Badge variant="outline" className="text-[9px] py-0 h-4">{s.format}</Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{s.owner}</div>
                        </div>
                      </div>

                      <p className="text-[10px] text-foreground/80 leading-relaxed pl-6">{s.purpose}</p>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pl-6">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> Cadence: <span className="text-foreground/90">{s.expectedCadence}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Database className="h-2.5 w-2.5" /> Umur: <span className="text-foreground font-mono">{s.ageHours}h</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ShieldCheck className="h-2.5 w-2.5" /> Legal: <span className={s.legalStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400'}>{s.legalStatus}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Server className="h-2.5 w-2.5" /> Konektivitas: <span className="text-foreground">{s.connectivityStatus}</span>
                        </div>
                      </div>

                      {s.lastLog && (
                        <div className="rounded bg-background/60 px-2 py-1 text-[9px] font-mono text-muted-foreground ml-6">
                          last: {s.lastLog.connector} · HTTP {s.lastLog.httpStatus ?? 'N/A'} · {s.lastLog.latencyMs ?? 'N/A'}ms · {s.lastLog.counts} item{s.lastLog.errorClass && <span className="text-red-400"> · {s.lastLog.errorClass}</span>}
                        </div>
                      )}

                      {s.notes && (
                        <p className="text-[9px] text-muted-foreground italic pl-6">{s.notes}</p>
                      )}

                      <div className="pl-6">
                        <a href={s.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                          Dokumentasi <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="rounded-lg border border-border bg-muted/20 p-3 text-[10px] text-muted-foreground space-y-1">
                <p><strong className="text-foreground">Catatan:</strong> Status kesehatan menggunakan 4 dimensi: konektivitas, validitas skema, freshness produk, dan kelengkapan.</p>
                <p>Alert kosong pada feed sah (mis. VAAC nihil advisory) BUKAN indikasi konektor gagal. Fetch gagal BUKAN berarti tidak ada kejadian.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Gagal memuat kesehatan sumber.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function SummaryCard({
  icon: Icon,
  color,
  bg,
  label,
  value,
}: {
  icon: any
  color: string
  bg: string
  label: string
  value: number
}) {
  return (
    <div className={`rounded-lg border border-border ${bg} p-2.5 text-center`}>
      <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </div>
  )
}
