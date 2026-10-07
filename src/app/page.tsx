'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/volcanic/Header'
import { DisclaimerBanner } from '@/components/volcanic/DisclaimerBanner'
import { EventList } from '@/components/volcanic/EventList'
import { MapLibreView } from '@/components/volcanic/MapLibreView'
import { MapLegend } from '@/components/volcanic/MapLegend'
import { EventDetail, type EventDetailData } from '@/components/volcanic/EventDetail'
import { DataHealth } from '@/components/volcanic/DataHealth'
import { UserGuideDialog } from '@/components/volcanic/UserGuideDialog'
import { DataSourceInfoDialog } from '@/components/volcanic/DataSourceInfoDialog'
import { Footer } from '@/components/volcanic/Footer'
import { Button } from '@/components/ui/button'
import {
  Activity,
  RefreshCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ListFilter,
  Layers,
  BookOpen,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import type { EventListItem, AviationColor, WindProfileData } from '@/components/volcanic/types'

export default function Home() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [healthOpen, setHealthOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterColor, setFilterColor] = useState<AviationColor | 'ALL'>('ALL')
  const [showModelLayer, setShowModelLayer] = useState(true)
  const [showWindLayer, setShowWindLayer] = useState(true)
  const [showPrecipLayer, setShowPrecipLayer] = useState(false)
  const [showVaacLayer, setShowVaacLayer] = useState(true)
  const [showWindGrid, setShowWindGrid] = useState(true)
  const [windGridLevel, setWindGridLevel] = useState(850)

  // Status Workspace Kejadian: Open/Close & Up/Down
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true)
  const [workspaceHeightMode, setWorkspaceHeightMode] = useState<'collapsed' | 'normal' | 'expanded'>('normal')

  // Status Legenda: Open/Close & Up/Down position
  const [isLegendOpen, setIsLegendOpen] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom'>('top')

  // Fetch volcanoes dengan deteksi error
  const {
    data: volcanoesData,
    isError: isVolcanoesError,
    refetch: refetchVolcanoes,
  } = useQuery({
    queryKey: ['volcanoes'],
    queryFn: async () => {
      const r = await fetch('/api/volcanoes')
      if (!r.ok) throw new Error('Gagal memuat data gunung api')
      return r.json()
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Fetch events dengan deteksi error
  const {
    data: eventsData,
    refetch: refetchEvents,
    isFetching: eventsFetching,
    isError: isEventsError,
    dataUpdatedAt: eventsUpdatedAt,
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const r = await fetch('/api/events')
      if (!r.ok) throw new Error('Gagal memuat daftar kejadian')
      return r.json()
    },
    refetchInterval: 60 * 1000,
    retry: 2,
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
    retry: 1,
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
    retry: 1,
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

  // Fetch wind field grid untuk overlay panah angin di peta (default 850 hPa)
  const {
    data: windFieldData,
    isError: isWindFieldError,
    refetch: refetchWindField,
  } = useQuery({
    queryKey: ['wind-field', windGridLevel],
    queryFn: async () => {
      const r = await fetch(`/api/wind-field?level=${windGridLevel}`)
      if (!r.ok) throw new Error('wind-field failed')
      return r.json()
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Derived: detail & wind profile langsung dari query data
  const selectedDetail = detailData ?? null
  const windProfile = windData ?? null
  const windFieldCells = windFieldData?.cells ?? []

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
    const vaacPolygons =
      (selectedDetail as any).vaacPolygons?.map((v: any) => ({
        geometry: v.geometry,
        flightLevel: v.flightLevel,
        ashTopMAsl: v.ashTopMAsl,
        movementText: v.movementText,
        confidence: v.confidence,
        observedAt: v.observedAt,
      })) ?? []
    const adminAreas = selectedDetail.potentialAreas
      .concat(selectedDetail.confirmedAreas)
      .map((a) => ({
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
      vaacPolygons,
      adminAreas,
      windLevels,
      volcanoLat: selectedDetail.event.volcano.lat,
      volcanoLng: selectedDetail.event.volcano.lng,
    }
  }, [selectedDetail, windProfile])

  const volcanoes = volcanoesData?.volcanoes ?? []
  const events = (eventsData?.events ?? []) as EventListItem[]
  const activeEventCount = events.length

  // Deteksi status koneksi API umum
  const hasApiError = isVolcanoesError || isEventsError || isWindFieldError
  const apiStatusText = hasApiError
    ? 'Terjadi kendala memuat sebagian data API'
    : `API Terhubung: ${volcanoes.length} Gunung Api · ${events.length} Kejadian Erupsi`

  // Kelas ketinggian workspace pada layar mobile/tablet
  const mobileHeightClasses = {
    collapsed: 'max-h-[46px] min-h-[46px]',
    normal: 'max-h-[38vh] min-h-[160px]',
    expanded: 'max-h-[75vh] min-h-[300px]',
  }

  // Toggle up/down ketinggian workspace
  const handleToggleWorkspaceHeight = () => {
    if (workspaceHeightMode === 'collapsed') {
      setWorkspaceHeightMode('normal')
    } else if (workspaceHeightMode === 'normal') {
      setWorkspaceHeightMode('expanded')
    } else {
      setWorkspaceHeightMode('collapsed')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        activeEventCount={activeEventCount}
        lastUpdated={lastUpdated}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenSources={() => setSourcesOpen(true)}
      />
      <DisclaimerBanner />

      <main className="flex flex-1 flex-col lg:flex-row min-h-0 relative overflow-hidden">
        {/* SIDEBAR WORKSPACE KEJADIAN VULKANIK (Bisa Open/Close dan Up/Down) */}
        {isWorkspaceOpen && (
          <aside
            className={`w-full lg:w-80 xl:w-96 shrink-0 border-r border-border bg-card/40 backdrop-blur flex flex-col min-h-0 z-20 transition-all duration-200 ${mobileHeightClasses[workspaceHeightMode]} lg:max-h-none`}
          >
            {/* Header Toolbar Workspace */}
            <div className="flex items-center gap-1.5 border-b border-border p-2 bg-muted/20 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0 mr-auto">
                <ListFilter className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold truncate">Kejadian Vulkanik</span>
                <span className="rounded-full bg-primary/20 text-primary text-[10px] px-1.5 py-0.2 font-mono">
                  {events.length}
                </span>
              </div>

              {/* Kontrol Ketinggian Up/Down di layar mobile/tablet */}
              <div className="flex lg:hidden items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleToggleWorkspaceHeight}
                  title={
                    workspaceHeightMode === 'expanded'
                      ? 'Turunkan panel (Down)'
                      : 'Naikkan panel (Up)'
                  }
                >
                  {workspaceHeightMode === 'expanded' ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setHealthOpen(true)}
                title="Periksa kesehatan koneksi sumber data"
              >
                <Activity className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                <span className="hidden sm:inline">Sumber</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => {
                  refetchEvents()
                  refetchVolcanoes()
                }}
                disabled={eventsFetching}
                title="Muat ulang data letusan"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-1 ${eventsFetching ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              {/* Tombol Tutup Workspace (Close) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => setIsWorkspaceOpen(false)}
                title="Tutup Workspace Kejadian (Perluas Peta)"
              >
                <ChevronLeft className="h-4 w-4 hidden lg:block" />
                <ChevronUp className="h-4 w-4 lg:hidden" />
              </Button>
            </div>

            {/* List Kejadian (bila tidak di-minimize ke mode collapsed) */}
            {workspaceHeightMode !== 'collapsed' && (
              <div className="flex-1 min-h-0 overflow-y-auto">
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
            )}
          </aside>
        )}

        {/* MAP AREA */}
        <section className="relative flex-1 min-h-[420px] lg:min-h-[500px] bg-[#0f1418] flex flex-col overflow-hidden">
          <MapLibreView
            volcanoes={volcanoes}
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
            selectedGeometry={selectedGeometry}
            showModelLayer={showModelLayer}
            showWindLayer={showWindLayer}
            showPrecipLayer={showPrecipLayer}
            showVaacLayer={showVaacLayer}
            showWindGrid={showWindGrid}
            windFieldCells={windFieldCells}
          />

          {/* TOMBOL BUKA WORKSPACE (Jika Workspace Ditutup) */}
          {!isWorkspaceOpen && (
            <div className="absolute left-3 top-3 z-20 animate-in fade-in slide-in-from-left duration-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsWorkspaceOpen(true)}
                className="h-8 gap-1.5 shadow-lg border border-border bg-card/95 backdrop-blur text-xs font-medium hover:bg-card text-foreground"
                title="Buka kembali daftar kejadian letusan"
              >
                <ListFilter className="h-3.5 w-3.5 text-primary" />
                <span>Kejadian Vulkanik</span>
                <span className="rounded-full bg-primary/20 text-primary text-[10px] px-1.5 py-0.2 font-mono">
                  {events.length}
                </span>
                <ChevronRight className="h-3.5 w-3.5 ml-0.5 text-muted-foreground" />
              </Button>
            </div>
          )}

          {/* STATUS INDIKATOR KESEHATAN API DI SUDUT ATAS PETA */}
          <div
            className={`absolute ${
              !isWorkspaceOpen ? 'left-48' : 'left-3'
            } top-3 z-10 hidden sm:flex items-center gap-2 transition-all`}
          >
            {hasApiError ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/20 border border-destructive/40 backdrop-blur text-xs text-red-200 shadow-md">
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                <span>Kendala sinkronisasi API</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-5 text-[10px] px-1.5 ml-1 border-destructive/40 text-red-200 hover:bg-destructive/30"
                  onClick={() => {
                    refetchEvents()
                    refetchVolcanoes()
                    refetchWindField()
                  }}
                >
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/85 border border-border/80 backdrop-blur text-[11px] text-muted-foreground shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-mono text-[10px]">{apiStatusText}</span>
              </div>
            )}
          </div>

          {/* TOMBOL PANDUAN & SUMBER DATA (FLOATING ACTION BUTTONS) */}
          <div className="absolute left-3 top-12 sm:top-14 z-10 flex items-center gap-1.5 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGuideOpen(true)}
              className="h-7 text-xs px-2.5 gap-1.5 bg-card/90 backdrop-blur border border-primary/40 text-primary hover:bg-primary/10 shadow-md font-medium"
              title="Buka panduan membaca peta dan simbol untuk orang awam"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Panduan Pengguna</span>
              <span className="md:hidden">Panduan</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSourcesOpen(true)}
              className="h-7 text-xs px-2.5 gap-1.5 bg-card/90 backdrop-blur border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 shadow-md font-medium"
              title="Informasi deskriptif lengkap terkait jenis dan sumber data"
            >
              <Database className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sumber &amp; Jenis Data</span>
              <span className="md:hidden">Sumber Data</span>
            </Button>
          </div>

          {/* LEGENDA & LAYER OVERLAY (Dukungan Open/Close dan Posisi Up/Down) */}
          <div
            className={`absolute z-20 w-60 max-w-[calc(100%-1.5rem)] transition-all duration-200 ${
              legendPosition === 'top' ? 'top-3 right-3' : 'bottom-3 right-3'
            }`}
          >
            <MapLegend
              showModelLayer={showModelLayer}
              showWindLayer={showWindLayer}
              showPrecipLayer={showPrecipLayer}
              showVaacLayer={showVaacLayer}
              showWindGrid={showWindGrid}
              windGridLevel={windGridLevel}
              onToggleModel={() => setShowModelLayer((v) => !v)}
              onToggleWind={() => setShowWindLayer((v) => !v)}
              onTogglePrecip={() => setShowPrecipLayer((v) => !v)}
              onToggleVaac={() => setShowVaacLayer((v) => !v)}
              onToggleWindGrid={() => setShowWindGrid((v) => !v)}
              onChangeWindGridLevel={setWindGridLevel}
              isOpen={isLegendOpen}
              onToggleOpen={() => setIsLegendOpen((o) => !o)}
              position={legendPosition}
              onTogglePosition={() => setLegendPosition((p) => (p === 'top' ? 'bottom' : 'top'))}
              onOpenGuide={() => setGuideOpen(true)}
            />
          </div>

          {/* KOTAK INFO CEPAT KEJADIAN TERPILIH (Pojok Kiri Bawah) */}
          {selectedListItem && (
            <div className="absolute left-3 bottom-3 z-10 max-w-[calc(100%-1.5rem)] sm:max-w-md rounded-lg border border-border bg-card/95 backdrop-blur p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${aviationDot(
                    selectedListItem.aviationColor
                  )}`}
                />
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
                      kolom ~
                      {selectedListItem.latestObservation.ashTopMAsl.toLocaleString('id-ID')} m ASL
                    </span>
                  )}
                  {selectedListItem.latestObservation.movementText && (
                    <span className="rounded bg-muted/60 px-1 py-0.5">
                      gerak: {selectedListItem.latestObservation.movementText}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PESAN JIKA DATA BELUM SIAP */}
          {events.length === 0 && !eventsFetching && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="rounded-lg border border-border bg-card/90 backdrop-blur p-4 text-center text-xs text-muted-foreground max-w-xs shadow-md">
                {hasApiError ? (
                  <div className="space-y-2 pointer-events-auto">
                    <p className="text-amber-300 font-medium">Gagal menghubungkan ke data server</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        refetchEvents()
                        refetchVolcanoes()
                      }}
                    >
                      Muat Ulang Sekarang
                    </Button>
                  </div>
                ) : (
                  <p>Memuat data kejadian. Catatan: daftar kosong &ne; tidak ada letusan.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL / SHEET DETAIL KEJADIAN */}
      <EventDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        detail={selectedDetail}
        loading={detailLoading}
        listItem={selectedListItem}
        windProfile={windProfile}
      />

      {/* MODAL KESEHATAN SUMBER */}
      <DataHealth
        open={healthOpen}
        onOpenChange={setHealthOpen}
        data={healthData}
        loading={healthLoading}
      />

      {/* DIALOG PANDUAN PENGGUNAAN (Luasan Layar Fleksibel & Ramah Orang Awam) */}
      <UserGuideDialog
        open={guideOpen}
        onOpenChange={setGuideOpen}
        onOpenSources={() => setSourcesOpen(true)}
      />

      {/* DIALOG INFORMASI DESKRIPTIF JENIS & SUMBER DATA */}
      <DataSourceInfoDialog open={sourcesOpen} onOpenChange={setSourcesOpen} />

      <Footer
        onOpenGuide={() => setGuideOpen(true)}
        onOpenSources={() => setSourcesOpen(true)}
      />
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
