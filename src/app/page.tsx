'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/volcanic/Header'
import { DisclaimerBanner } from '@/components/volcanic/DisclaimerBanner'
import { EventList } from '@/components/volcanic/EventList'
import { MapView } from '@/components/volcanic/MapView'
import { MapLegend } from '@/components/volcanic/MapLegend'
import { EventDetail, type EventDetailData } from '@/components/volcanic/EventDetail'
import { DataHealth } from '@/components/volcanic/DataHealth'
import { Footer } from '@/components/volcanic/Footer'
import { Button } from '@/components/ui/button'
import { Activity, RefreshCw, Maximize2 } from 'lucide-react'
import type { EventListItem, AviationColor, WindProfileData } from '@/components/volcanic/types'

export default function Home() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [healthOpen, setHealthOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterColor, setFilterColor] = useState<AviationColor | 'ALL'>('ALL')
  const [showModelLayer, setShowModelLayer] = useState(true)
  const [showWindLayer, setShowWindLayer] = useState(true)
  const [showPrecipLayer, setShowPrecipLayer] = useState(false)

  // Fetch volcanoes
  const { data: volcanoesData } = useQuery({
    queryKey: ['volcanoes'],
    queryFn: async () => {
      const r = await fetch('/api/volcanoes')
      if (!r.ok) throw new Error('volcanoes failed')
      return r.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch events
  const { data: eventsData, refetch: refetchEvents, isFetching: eventsFetching, dataUpdatedAt: eventsUpdatedAt } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const r = await fetch('/api/events')
      if (!r.ok) throw new Error('events failed')
      return r.json()
    },
    refetchInterval: 60 * 1000,
  })

  // Waktu terakhir pembaruan events (UTC HH:MM)
  const lastUpdated = eventsUpdatedAt
    ? new Date(eventsUpdatedAt).toISOString().slice(11, 16) + 'Z'
    : '—'

  // Fetch event detail + wind profile saat dipilih
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['event-detail', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return null
      const r = await fetch(`/api/events/${selectedEventId}`)
      if (!r.ok) throw new Error('detail failed')
      return r.json() as Promise<EventDetailData>
    },
    enabled: !!selectedEventId,
  })

  const { data: windData } = useQuery({
    queryKey: ['wind-profile', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return null
      const r = await fetch(`/api/wind-profile?eventId=${selectedEventId}`)
      if (!r.ok) throw new Error('wind failed')
      return r.json() as Promise<WindProfileData>
    },
    enabled: !!selectedEventId,
  })

  // Fetch source health (lazy — saat panel dibuka)
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['source-health'],
    queryFn: async () => {
      const r = await fetch('/api/source-health')
      if (!r.ok) throw new Error('health failed')
      return r.json()
    },
    enabled: healthOpen,
    staleTime: 30 * 1000,
  })

  // Derived: detail & wind profile langsung dari query data (bukan state copy)
  const selectedDetail = detailData ?? null
  const windProfile = windData ?? null

  const handleSelectEvent = useCallback((id: string) => {
    setSelectedEventId(id)
    setDetailOpen(true)
  }, [])

  // Selected event list item (untuk header detail)
  const selectedListItem = useMemo(() => {
    if (!eventsData || !selectedEventId) return null
    return (eventsData.events as EventListItem[]).find((e) => e.id === selectedEventId) ?? null
  }, [eventsData, selectedEventId])

  // Geometry untuk dipetakan pada map dari selectedDetail
  const selectedGeometry = useMemo(() => {
    if (!selectedDetail) return null
    const polygons = selectedDetail.footprints.map((f) => ({
      geometry: f.geometry,
      metric: f.metric,
      value: f.value,
      nMembers: f.nMembers,
      nIntersect: f.nIntersect,
      verticalBand: f.verticalBand,
      validFrom: f.validFrom,
      validTo: f.validTo,
    }))
    const trajectories = selectedDetail.trajectories.map((t) => ({
      geometry: t.geometry,
      validFrom: t.validFrom,
      validTo: t.validTo,
      verticalBand: t.verticalBand,
    }))
    const adminAreas = selectedDetail.potentialAreas.concat(selectedDetail.confirmedAreas).map((a) => ({
      name: a.adminUnit.name,
      lat: a.adminUnit.lat,
      lng: a.adminUnit.lng,
      ratio: a.ratio,
      isConfirmed: a.isConfirmed,
    }))
    const windLevels = windProfile?.levels ?? []
    return {
      polygons,
      trajectories,
      adminAreas,
      windLevels,
      volcanoLat: selectedDetail.event.volcano.lat,
      volcanoLng: selectedDetail.event.volcano.lng,
    }
  }, [selectedDetail, windProfile])

  const volcanoes = volcanoesData?.volcanoes ?? []
  const events = (eventsData?.events ?? []) as EventListItem[]
  const activeEventCount = events.length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header activeEventCount={activeEventCount} lastUpdated={lastUpdated} />
      <DisclaimerBanner />

      <main className="flex flex-1 flex-col lg:flex-row min-h-0">
        {/* Sidebar event list */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-r border-border bg-card/30 flex flex-col min-h-0 max-h-[40vh] lg:max-h-none">
          <div className="flex items-center gap-2 border-b border-border p-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setHealthOpen(true)}
            >
              <Activity className="h-3.5 w-3.5 mr-1" /> Kesehatan Sumber
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs ml-auto"
              onClick={() => refetchEvents()}
              disabled={eventsFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${eventsFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Muat ulang</span>
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <EventList
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              search={search}
              onSearchChange={setSearch}
              filterColor={filterColor}
              onFilterColorChange={setFilterColor}
            />
          </div>
        </aside>

        {/* Map area */}
        <section className="relative flex-1 min-h-[420px] lg:min-h-0 bg-[#0f1418]">
          <MapView
            volcanoes={volcanoes}
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
            selectedGeometry={selectedGeometry}
            showModelLayer={showModelLayer}
            showWindLayer={showWindLayer}
            showPrecipLayer={showPrecipLayer}
          />

          {/* Legend overlay */}
          <div className="absolute right-3 top-3 w-56 max-w-[calc(100%-1.5rem)]">
            <MapLegend
              showModelLayer={showModelLayer}
              showWindLayer={showWindLayer}
              showPrecipLayer={showPrecipLayer}
              onToggleModel={() => setShowModelLayer((v) => !v)}
              onToggleWind={() => setShowWindLayer((v) => !v)}
              onTogglePrecip={() => setShowPrecipLayer((v) => !v)}
            />
          </div>

          {/* Selected event quick info (bottom-left) */}
          {selectedListItem && (
            <div className="absolute left-3 bottom-3 max-w-[calc(100%-1.5rem)] sm:max-w-md rounded-lg border border-border bg-card/95 backdrop-blur p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2 w-2 rounded-full ${aviationDot(selectedListItem.aviationColor)}`} />
                <span className="text-sm font-semibold">{selectedListItem.volcano.name}</span>
                <span className="rounded border border-border bg-muted/40 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
                  {selectedListItem.volcano.code}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 ml-auto text-xs px-2"
                  onClick={() => setDetailOpen(true)}
                >
                  <Maximize2 className="h-3 w-3 mr-1" /> Detail
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                {selectedListItem.summary}
              </p>
              {selectedListItem.latestObservation && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                  {selectedListItem.latestObservation.ashTopMAsl != null && (
                    <span className="rounded bg-muted/60 px-1 py-0.5 font-mono">
                      kolom ~{selectedListItem.latestObservation.ashTopMAsl.toLocaleString('id-ID')} m ASL
                    </span>
                  )}
                  {selectedListItem.latestObservation.movementText && (
                    <span className="rounded bg-muted/60 px-1 py-0.5">gerak: {selectedListItem.latestObservation.movementText}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty state hint */}
          {events.length === 0 && !eventsFetching && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-lg border border-border bg-card/80 p-4 text-center text-xs text-muted-foreground max-w-xs">
                Memuat data kejadian. Catatan: daftar kosong ≠ tidak ada letusan.
              </div>
            </div>
          )}
        </section>
      </main>

      <EventDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        detail={selectedDetail}
        loading={detailLoading}
        listItem={selectedListItem}
        windProfile={windProfile}
      />

      <DataHealth
        open={healthOpen}
        onOpenChange={setHealthOpen}
        data={healthData}
        loading={healthLoading}
      />

      <Footer />
    </div>
  )
}

function aviationDot(color: AviationColor) {
  switch (color) {
    case 'GREEN':
      return 'bg-emerald-400'
    case 'YELLOW':
      return 'bg-amber-300'
    case 'ORANGE':
      return 'bg-orange-400'
    case 'RED':
      return 'bg-red-400'
  }
}
