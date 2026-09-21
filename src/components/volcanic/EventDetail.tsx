'use client'

import { useEffect, useMemo, useRef } from 'react'
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
  X,
  Clock,
  AlertTriangle,
  FileText,
  Beaker,
  Wind,
  MapPin,
  ExternalLink,
  CheckCircle2,
  CircleDashed,
  Eye,
  Users,
  Cloud,
} from 'lucide-react'
import type { EventListItem, AviationColor } from './types'
import { AVIATION_COLOR_META, STATUS_LABELS, EVIDENCE_TYPE_META } from './types'
import { WindProfile } from './WindProfile'
import type { WindProfileData } from './types'

export interface EventDetailData {
  event: {
    id: string
    onsetAt: string
    endAt: string | null
    status: string
    aviationColor: AviationColor
    summary: string
    volcano: {
      id: string
      code: string
      name: string
      lat: number
      lng: number
      summitMAsl: number
      province: string
      region: string
      krStatus: string
    }
  }
  timeline: Array<{
    kind: 'document' | 'observation' | 'model_run'
    at: string
    [key: string]: any
  }>
  documents: Array<{
    id: string
    type: string
    evidenceType: string
    externalId: string | null
    issuedAt: string
    validFrom: string
    validTo: string | null
    url: string
    revision: number
    rawSummary: string
  }>
  observations: Array<{
    id: string
    evidenceType: string
    ashTopMAsl: number | null
    ashTopOriginal: string | null
    ashAboveSummitM: number | null
    movementToDeg: number | null
    movementFromDeg: number | null
    movementText: string | null
    method: string
    confidence: string
    observedAt: string
    conflict: string | null
  }>
  modelRuns: Array<{
    id: string
    modelVersion: string
    configHash: string
    metProvider: string
    metCycleAt: string
    startedAt: string
    finishedAt: string | null
    status: string
    isUnitSource: boolean
    assumptions: any
  }>
  footprints: any[]
  trajectories: any[]
  vaacPolygons?: Array<{
    evidenceType: string
    flightLevel: string
    ashTopMAsl: number | null
    movementToDeg: number | null
    movementText: string | null
    confidence: string
    observedAt: string
    geometry: any
  }>
  potentialAreas: any[]
  confirmedAreas: any[]
  messages: {
    modelLabel: string
    notAConfirmation: string
    unitSource: string | null
  }
}

interface EventDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: EventDetailData | null
  loading: boolean
  listItem: EventListItem | null
  windProfile: WindProfileData | null
}

export function EventDetail({
  open,
  onOpenChange,
  detail,
  loading,
  listItem,
  windProfile,
}: EventDetailProps) {
  // Ref ke scroll container — native div agar PageUp/PageDown/Home/End/Space bekerja.
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fokuskan scroll container saat sheet terbuka & detail selesai dimuat.
  // Native scrollable element dengan tabindex=0 akan menerima keyboard navigation
  // (PageUp/PageDown/Space/Home/End/Arrow keys) tanpa handler tambahan.
  useEffect(() => {
    if (open && !loading && detail) {
      // Delay sedikit agar animasi slide-in selesai sebelum fokus
      const t = setTimeout(() => {
        scrollRef.current?.focus({ preventScroll: true })
      }, 120)
      return () => clearTimeout(t)
    }
  }, [open, loading, detail])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl p-0 flex flex-col bg-background"
      >
        <SheetHeader className="border-b border-border px-4 py-3 space-y-1 text-left">
          {listItem && (
            <>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${AVIATION_COLOR_META[listItem.aviationColor].dot}`} />
                <SheetTitle className="text-base">{listItem.volcano.name}</SheetTitle>
                <Badge variant="outline" className="font-mono text-[10px]">{listItem.volcano.code}</Badge>
                <span className={`ml-auto rounded border ${AVIATION_COLOR_META[listItem.aviationColor].border} ${AVIATION_COLOR_META[listItem.aviationColor].bg} ${AVIATION_COLOR_META[listItem.aviationColor].text} px-1.5 py-0.5 text-[10px] font-medium`}>
                  {listItem.aviationColor}
                </span>
              </div>
              <SheetDescription className="text-xs">
                {STATUS_LABELS[listItem.status as keyof typeof STATUS_LABELS] ?? listItem.status}
                {' · '}
                {listItem.volcano.province}
                {' · '}
                {listItem.volcano.krStatus}
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Memuat detail kejadian...
          </div>
        ) : detail ? (
          <div
            ref={scrollRef}
            role="region"
            aria-label="Konten detail kejadian"
            tabIndex={0}
            className="scroll-volcanic flex-1 overflow-y-auto outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          >
            <div className="space-y-5 p-4">
              {/* Ringkasan */}
              <section className="rounded-lg border border-border bg-card/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ringkasan Resmi</h3>
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">{detail.event.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Onset: <span className="font-mono text-foreground">{new Date(detail.event.onsetAt).toISOString().replace('T', ' ').slice(0, 16)}Z</span></span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {detail.event.volcano.lat.toFixed(3)}°, {detail.event.volcano.lng.toFixed(3)}°</span>
                  <span className="inline-flex items-center gap-1">puncak: <span className="font-mono text-foreground">{detail.event.volcano.summitMAsl.toLocaleString('id-ID')} m ASL</span></span>
                </div>
              </section>

              {/* Pesan kunci INDIKASI MODEL */}
              {detail.messages.unitSource && (
                <section className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-orange-300">{detail.messages.modelLabel}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-orange-100/90">{detail.messages.unitSource}</p>
                  <p className="mt-1.5 text-[10px] text-orange-200/80 italic">{detail.messages.notAConfirmation}</p>
                </section>
              )}

              {/* Observasi abu */}
              {detail.observations.length > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bukti Observasi</h3>
                  </div>
                  {detail.observations.map((o, i) => {
                    const evMeta = EVIDENCE_TYPE_META[o.evidenceType as keyof typeof EVIDENCE_TYPE_META]
                    return (
                      <div key={o.id ?? i} className="rounded-lg border border-border bg-card/40 p-2.5 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{o.evidenceType}</Badge>
                          {evMeta && <span className={`text-[10px] font-medium ${evMeta.color}`}>{evMeta.label}</span>}
                          <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                            {new Date(o.observedAt).toISOString().replace('T', ' ').slice(0, 16)}Z
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                          {o.ashTopMAsl != null && (
                            <div><span className="text-muted-foreground">Kolom abu:</span> <span className="font-mono text-foreground">~{o.ashTopMAsl.toLocaleString('id-ID')} m ASL</span></div>
                          )}
                          {o.ashTopOriginal && (
                            <div><span className="text-muted-foreground">Nilai asli:</span> <span className="font-mono text-foreground">{o.ashTopOriginal}</span></div>
                          )}
                          {o.ashAboveSummitM != null && (
                            <div><span className="text-muted-foreground">Di atas puncak:</span> <span className="font-mono text-foreground">+{o.ashAboveSummitM} m</span></div>
                          )}
                          {o.movementText && (
                            <div><span className="text-muted-foreground">Gerak:</span> <span className="text-foreground">{o.movementText}</span></div>
                          )}
                          <div><span className="text-muted-foreground">Metode:</span> <span className="text-foreground">{o.method}</span></div>
                          <div><span className="text-muted-foreground">Konfidens:</span> <span className="text-foreground">{o.confidence}</span></div>
                        </div>
                        {o.conflict && (
                          <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2 text-[10px] text-amber-200">
                            <div className="flex items-center gap-1 font-medium mb-0.5">
                              <AlertTriangle className="h-3 w-3" /> Konflik sumber terdeteksi
                            </div>
                            {o.conflict}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </section>
              )}

              {/* VAAC advisory atmosfer multi-flight-level */}
              {detail.vaacPolygons && detail.vaacPolygons.length > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-3.5 w-3.5 text-fuchsia-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">VAAC Advisory — Abu Atmosfer Multi-Lapis</h3>
                  </div>
                  <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-2.5">
                    <p className="text-[10px] text-fuchsia-200/80 mb-2 italic">
                      Advisory VAAC = abu di <strong>ruang udara</strong>, BUKAN jatuhan permukaan.
                      Polygon berlapis per flight level (ICAO FL) sesuai arah gerak angin pada lapisan atmosfer tersebut.
                    </p>
                    <div className="space-y-1.5">
                      {detail.vaacPolygons.map((v, i) => (
                        <div key={i} className="rounded border border-fuchsia-500/25 bg-fuchsia-500/5 px-2 py-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] border-fuchsia-500/40 text-fuchsia-300">{v.flightLevel}</Badge>
                            {v.ashTopMAsl != null && (
                              <span className="text-[10px] text-muted-foreground">~{v.ashTopMAsl.toLocaleString('id-ID')} m ASL</span>
                            )}
                            {v.movementText && (
                              <span className="text-[10px] text-foreground/90">gerak: {v.movementText}</span>
                            )}
                            <span className="ml-auto text-[9px] text-muted-foreground font-mono">
                              {new Date(v.observedAt).toISOString().replace('T', ' ').slice(0, 16)}Z
                            </span>
                          </div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">metode: VAAC satellite + model guidance · konfidens: {v.confidence}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-fuchsia-200/70 mt-2 italic">
                      Keputusan penerbangan rujuk VAAC Darwin / AirNav Indonesia resmi. Produk ini hanya fusi bukti.
                    </p>
                  </div>
                </section>
              )}

              {/* Timeline */}
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline Bukti</h3>
                </div>
                <ol className="relative border-l border-border ml-2 space-y-2.5 pl-3">
                  {detail.timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.35rem] top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-mono text-muted-foreground">{new Date(t.at).toISOString().replace('T', ' ').slice(0, 16)}Z</span>
                        <Badge variant="secondary" className="text-[9px] py-0 h-4">{t.kind}</Badge>
                        {t.kind === 'document' && <span className="text-muted-foreground">{t.type}</span>}
                        {t.kind === 'observation' && <span className="text-muted-foreground">{t.method}</span>}
                        {t.kind === 'model_run' && <span className="text-muted-foreground">{t.modelVersion}</span>}
                      </div>
                      {t.kind === 'document' && (
                        <p className="mt-0.5 text-[10px] text-foreground/80 line-clamp-2">{t.rawSummary}</p>
                      )}
                      {t.kind === 'observation' && t.ashTopMAsl != null && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">kolom ~{t.ashTopMAsl} m ASL</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>

              {/* Wind profile */}
              <section className="rounded-lg border border-border bg-card/40 p-3">
                <WindProfile data={windProfile} />
              </section>

              {/* Model run + assumptions */}
              {detail.modelRuns.length > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-3.5 w-3.5 text-orange-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model Run & Asumsi</h3>
                  </div>
                  {detail.modelRuns.map((m) => (
                    <div key={m.id} className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-2.5 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] border-orange-500/40 text-orange-300">{m.modelVersion}</Badge>
                        {m.isUnitSource && (
                          <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] text-orange-300">unit-source 1g</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">{m.metProvider}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">{m.status}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono break-all">config: {m.configHash}</div>
                      <Separator className="opacity-50" />
                      <div className="grid grid-cols-1 gap-1 text-[10px]">
                        {Object.entries(m.assumptions).filter(([k]) => k !== 'windLevels').map(([k, v]) => (
                          <div key={k} className="flex gap-1.5">
                            <span className="text-muted-foreground shrink-0">{k}:</span>
                            <span className="text-foreground/90 break-words">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Dua daftar terpisah: potensi model vs terkonfirmasi permukaan */}
              <section className="grid grid-cols-1 gap-2">
                {/* Potensi model — INDIKASI */}
                <div className="rounded-lg border border-orange-500/40 bg-orange-500/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CircleDashed className="h-3.5 w-3.5 text-orange-400" />
                    <h3 className="text-xs font-semibold text-orange-300">Wilayah Berpotensi Terlintasi (Model)</h3>
                  </div>
                  <p className="text-[10px] text-orange-200/80 mb-2 italic">INDIKASI MODEL — bukan konfirmasi abu. Sensitif terhadap input & siklus cuaca.</p>
                  {detail.potentialAreas.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">Tidak ada wilayah teroverlay pada footprint model.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {detail.potentialAreas.map((a, i) => (
                        <li key={i} className="flex items-center justify-between gap-2 rounded border border-orange-500/20 bg-orange-500/5 px-2 py-1">
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{a.adminUnit.name}</div>
                            <div className="text-[9px] text-muted-foreground">{a.adminUnit.province}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] font-mono text-orange-300">{(a.ratio * 100).toFixed(0)}% area</div>
                            {a.populationProxy != null && (
                              <div className="text-[9px] text-muted-foreground flex items-center justify-end gap-0.5">
                                <Users className="h-2.5 w-2.5" />~{a.populationProxy.toLocaleString('id-ID')}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Terkonfirmasi permukaan */}
                <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                    <h3 className="text-xs font-semibold text-red-300">Terkonfirmasi Terdampak Permukaan</h3>
                  </div>
                  {detail.confirmedAreas.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">
                      Belum ada konfirmasi resmi jatuhan abu permukaan.
                      <strong className="text-foreground/80"> Tidak adanya data ≠ tidak terdampak.</strong>
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {detail.confirmedAreas.map((a, i) => (
                        <li key={i} className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs">
                          {a.adminUnit.name} — {a.adminUnit.province}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              {/* Dokumen sumber */}
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dokumen Sumber (Provenance)</h3>
                </div>
                {detail.documents.map((d) => (
                  <div key={d.id} className="rounded-lg border border-border bg-card/40 p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                      <span className="text-[10px] text-muted-foreground">rev {d.revision}</span>
                      {d.externalId && <span className="text-[9px] font-mono text-muted-foreground truncate">{d.externalId.slice(0, 8)}…</span>}
                      <span className="ml-auto text-[10px] text-muted-foreground font-mono">{new Date(d.issuedAt).toISOString().replace('T', ' ').slice(0, 16)}Z</span>
                    </div>
                    <p className="text-[10px] text-foreground/80 leading-relaxed">{d.rawSummary}</p>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                      Baca sumber asli <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                ))}
              </section>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Tidak ada data.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
