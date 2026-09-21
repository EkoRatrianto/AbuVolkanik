'use client'

import { useMemo } from 'react'
import { Search, Mountain, AlertCircle, ArrowUpRight } from 'lucide-react'
import type { EventListItem, AviationColor } from './types'
import { AVIATION_COLOR_META, STATUS_LABELS } from './types'

interface EventListProps {
  events: EventListItem[]
  selectedEventId: string | null
  onSelectEvent: (id: string) => void
  search: string
  onSearchChange: (v: string) => void
  filterColor: AviationColor | 'ALL'
  onFilterColorChange: (v: AviationColor | 'ALL') => void
}

export function EventList({
  events,
  selectedEventId,
  onSelectEvent,
  search,
  onSearchChange,
  filterColor,
  onFilterColorChange,
}: EventListProps) {
  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterColor !== 'ALL' && e.aviationColor !== filterColor) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !e.volcano.name.toLowerCase().includes(q) &&
          !e.volcano.province.toLowerCase().includes(q) &&
          !e.volcano.region.toLowerCase().includes(q) &&
          !e.summary.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [events, search, filterColor])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <Mountain className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Kejadian Vulkanik</h2>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            {filtered.length}/{events.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari gunung / wilayah..."
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(['ALL', 'RED', 'ORANGE', 'YELLOW', 'GREEN'] as const).map((c) => (
            <button
              key={c}
              onClick={() => onFilterColorChange(c)}
              className={`rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                filterColor === c
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {c === 'ALL' ? 'Semua' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-volcanic flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Tidak ada kejadian cocok dengan filter.
            <br />
            <span className="text-[10px]">
              Catatan: tidak adanya kejadian pada daftar ≠ tidak ada letusan.
            </span>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((e) => {
              const meta = AVIATION_COLOR_META[e.aviationColor]
              const isSelected = e.id === selectedEventId
              return (
                <li key={e.id}>
                  <button
                    onClick={() => onSelectEvent(e.id)}
                    className={`flex w-full flex-col gap-1.5 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                      <span className="text-sm font-semibold truncate">{e.volcano.name}</span>
                      <span className="ml-auto shrink-0 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                        {e.volcano.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className={`rounded border ${meta.border} ${meta.bg} ${meta.text} px-1 py-0.5 font-medium`}>
                        {e.aviationColor}
                      </span>
                      <span className="truncate">{STATUS_LABELS[e.status]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="font-mono">{formatUtcShort(e.onsetAt)} UTC</span>
                      {e.volcano.province && (
                        <>
                          <span>·</span>
                          <span className="truncate">{e.volcano.province}</span>
                        </>
                      )}
                    </div>
                    {e.latestObservation && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        {e.latestObservation.ashTopMAsl != null && (
                          <span className="rounded bg-muted/60 px-1 py-0.5 font-mono">
                            kolom ~{e.latestObservation.ashTopMAsl.toLocaleString('id-ID')} m ASL
                          </span>
                        )}
                        {e.latestObservation.movementText && (
                          <span className="rounded bg-muted/60 px-1 py-0.5">
                            gerak: {e.latestObservation.movementText}
                          </span>
                        )}
                        {e.latestObservation.hasConflict && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1 py-0.5 text-amber-300">
                            <AlertCircle className="h-2.5 w-2.5" /> konflik
                          </span>
                        )}
                        {e.hasModelRun && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-orange-500/15 px-1 py-0.5 text-orange-300">
                            <ArrowUpRight className="h-2.5 w-2.5" /> model
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function formatUtcShort(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
