// Tipe bersama untuk komponen UI pemantauan abu vulkanik

export type AviationColor = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'

export type EventStatus =
  | 'officially_monitored'
  | 'atmospheric_ash_observed'
  | 'potentially_crossed'
  | 'confirmed_surface_impact'

export type EvidenceType =
  | 'OBS-VOLCANO'
  | 'ADV-AIRSPACE'
  | 'OBS-GROUND'
  | 'OBS-SAT'
  | 'FCST-MET'
  | 'MODEL-TRAJ'
  | 'MODEL-DISP'
  | 'REPORT-UNVERIFIED'

export interface VolcanoSummary {
  id: string
  code: string
  name: string
  lat: number
  lng: number
  summitMAsl: number
  province: string
  region: string
  aviationColor: AviationColor
  krStatus: string
  eventCount: number
}

export interface EventListItem {
  id: string
  onsetAt: string
  endAt: string | null
  status: EventStatus
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
  evidenceCount: number
  hasModelRun: boolean
  latestObservation: {
    ashTopMAsl: number | null
    movementText: string | null
    method: string
    observedAt: string
    confidence: string
    hasConflict: boolean
  } | null
}

export interface WindLevel {
  pressureHpa: number
  zMAsl: number
  windFromDeg: number
  speedMs: number
  precipMm: number
  u: number
  v: number
  moveToDeg: number
  aglM: number
}

export interface WindProfileData {
  volcano: {
    name: string
    summitMAsl: number
    lat: number
    lng: number
  }
  metProvider: string
  metCycleAt: string | null
  label: string
  levels: WindLevel[]
  hiddenBelowGround: Array<{ pressureHpa: number; zMAsl: number }>
  terrainMAsl: number
  note: string
}

export interface SourceHealthItem {
  sourceId: string
  owner: string
  format: string
  license: string
  purpose: string
  expectedCadence: string
  legalStatus: string
  connectivityStatus: string
  attribution: string
  notes: string | null
  docsUrl: string
  endpoint: string | null
  health: 'green' | 'yellow' | 'red'
  lastVerifiedAt: string | null
  lastFetchedAt: string | null
  ageHours: number
  lastLog: {
    runId: string
    connector: string
    httpStatus: number | null
    latencyMs: number | null
    counts: number
    errorClass: string | null
    fetchedAt: string
  } | null
}

// Warna kode penerbangan sesuai standar ICAO
export const AVIATION_COLOR_META: Record<
  AviationColor,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  GREEN: {
    label: 'GREEN — Normal',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
  },
  YELLOW: {
    label: 'YELLOW — Waspada',
    bg: 'bg-amber-400/15',
    text: 'text-amber-300',
    border: 'border-amber-400/40',
    dot: 'bg-amber-300',
  },
  ORANGE: {
    label: 'ORANGE — Siaga',
    bg: 'bg-orange-500/20',
    text: 'text-orange-300',
    border: 'border-orange-500/50',
    dot: 'bg-orange-400',
  },
  RED: {
    label: 'RED — Awas',
    bg: 'bg-red-500/20',
    text: 'text-red-300',
    border: 'border-red-500/50',
    dot: 'bg-red-400',
  },
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  officially_monitored: 'Terpantau resmi',
  atmospheric_ash_observed: 'Abu atmosfer teramati resmi',
  potentially_crossed: 'Berpotensi terlintasi (model)',
  confirmed_surface_impact: 'Terkonfirmasi terdampak permukaan',
}

export const EVIDENCE_TYPE_META: Record<
  EvidenceType,
  { label: string; color: string; desc: string }
> = {
  'OBS-VOLCANO': {
    label: 'Notice vulkanologi resmi',
    color: 'text-red-300',
    desc: 'VONA PVMBG — letusan/awan abu dilaporkan',
  },
  'ADV-AIRSPACE': {
    label: 'Advisory penerbangan',
    color: 'text-fuchsia-300',
    desc: 'VAA/VAG VAAC — abu di ruang udara, BUKAN otomatis jatuhan permukaan',
  },
  'OBS-GROUND': {
    label: 'Observasi permukaan resmi',
    color: 'text-red-400',
    desc: 'Laporan instansi jatuhan abu — bisa berstatus terkonfirmasi permukaan',
  },
  'OBS-SAT': {
    label: 'Retrieval satelit',
    color: 'text-purple-300',
    desc: 'Produk ash-specific dengan QA — abu atmosfer, bukan deposisi',
  },
  'FCST-MET': {
    label: 'Prakiraan meteorologi',
    color: 'text-sky-300',
    desc: 'GFS/BMKG/Open-Meteo — kondisi atmosfer, BUKAN keberadaan abu',
  },
  'MODEL-TRAJ': {
    label: 'Trajektori parcel udara',
    color: 'text-orange-300',
    desc: 'HYSPLIT trajectory — jalur massa udara, bukan volume abu',
  },
  'MODEL-DISP': {
    label: 'Simulasi dispersi',
    color: 'text-orange-400',
    desc: 'HYSPLIT ensemble — area kemungkinan, status indikasi model',
  },
  'REPORT-UNVERIFIED': {
    label: 'Laporan belum terverifikasi',
    color: 'text-stone-300',
    desc: 'Warga/media — petunjuk verifikasi, tidak menaikkan status publik',
  },
}
