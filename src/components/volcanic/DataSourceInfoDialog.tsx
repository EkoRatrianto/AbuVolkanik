'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Database,
  ShieldCheck,
  Activity,
  Wind,
  Layers,
  Cloud,
  Clock,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  FileText,
  Radio,
  CheckCircle2,
  AlertCircle,
  Server,
  Sparkles,
} from 'lucide-react'

interface DataSourceInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DataSourceDetail {
  id: string
  name: string
  agency: string
  role: string
  dataType: string
  cadence: string
  format: string
  confidence: 'Tinggi (Ground Truth)' | 'Sedang-Tinggi (Observasi Satelit)' | 'Simulasi (Indikasi Model)'
  confidenceColor: string
  endpoint: string
  legalStatus: string
  description: string
  parameters: string[]
}

const DATA_SOURCES: DataSourceDetail[] = [
  {
    id: 'pvmbg',
    name: 'MAGMA Indonesia / PVMBG',
    agency: 'Pusat Vulkanologi dan Mitigasi Bencana Geologi — Badan Geologi, KESDM RI',
    role: 'Sumber Utama Kebencanaan Vulkanik & Ground Truth',
    dataType: 'Laporan Erupsi, Dokumen Resmi VONA (Volcano Observatory Notice for Aviation)',
    cadence: 'Realtime / Saat Terjadi Erupsi',
    format: 'REST API, JSON, Dokumen PDF/Web MAGMA',
    confidence: 'Tinggi (Ground Truth)',
    confidenceColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    endpoint: 'https://magma.esdm.go.id/vona',
    legalStatus: 'Disetujui — Data Terbuka Resmi Kementerian ESDM RI',
    description:
      'PVMBG merupakan otoritas negara Republik Indonesia yang memiliki pos pengamatan fisik di setiap gunung api aktif. Parameter tinggi kolom letusan, arah pergerakan visual abu, dan status Tingkat Aktivitas (Level I s.d. Level IV) bersumber langsung dari pengamat darat PVMBG.',
    parameters: [
      'Tinggi kolom abu (m ASL dan m AGL)',
      'Arah pergerakan abu hasil observasi visual darat',
      'Kode warna penerbangan (GREEN, YELLOW, ORANGE, RED)',
      'Tingkat Aktivitas / KRB (Normal, Waspada, Siaga, Awas)',
      'Waktu onset letusan dalam UTC & WIB/WITA/WIT',
    ],
  },
  {
    id: 'bmkg',
    name: 'BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)',
    agency: 'BMKG Republik Indonesia',
    role: 'Dinamika Cuaca, Presipitasi & Angin Regional',
    dataType: 'Prakiraan Angin Permukaan, Analisis Monsun, Curah Hujan & Citra Radar Cuaca',
    cadence: 'Pembaruan berkala per 3–6 Jam',
    format: 'Open Data BMKG, GRIB2, GeoJSON, WMO GTS',
    confidence: 'Tinggi (Ground Truth)',
    confidenceColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    endpoint: 'https://data.bmkg.go.id/',
    legalStatus: 'Disetujui — Kebijakan Satu Data Indonesia BMKG',
    description:
      'BMKG menyediakan data parameter cuaca nasional. Pola angin regional dan curah hujan sangat menentukan apakah abu vulkanik akan terbawa ke permukiman padat atau tercuci oleh hujan (wet deposition/scavenging).',
    parameters: [
      'Arah dan kecepatan angin lapisan permukaan (10m)',
      'Intensitas curah hujan / presipitasi (mm/jam)',
      'Kelembapan udara dan potensi awan konvektif',
      'Peringatan dini cuaca ekstrem daerah terdampak',
    ],
  },
  {
    id: 'vaac',
    name: 'VAAC Darwin (Volcanic Ash Advisory Centre)',
    agency: 'Bureau of Meteorology (BoM), Australia / ICAO',
    role: 'Pemantauan Abu Atmosfer Ruang Udara Penerbangan',
    dataType: 'Dokumen VAA (Volcanic Ash Advisory) & Poligon Poligon Ruang Udara per Flight Level',
    cadence: 'Tiap 6 Jam pada Letusan Aktif (atau Ad-hoc)',
    format: 'ICAO Annex 3 Bulletins, VAA Text, GeoJSON Poligon',
    confidence: 'Sedang-Tinggi (Observasi Satelit)',
    confidenceColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    endpoint: 'https://www.bom.gov.au/aviation/volcanic-ash/',
    legalStatus: 'Disetujui — Kerjasama Regional ICAO Kawasan Asia Tenggara & Pasifik',
    description:
      'VAAC Darwin bertanggung jawab atas ruang udara Indonesia dan Australia di bawah mandat ICAO. Menggunakan citra satelit Himawari-9 (JMA) dan radar cuaca untuk mendeteksi batas terluar awan abu di langit yang berbahaya bagi turbin pesawat jet komersial.',
    parameters: [
      'Poligon batas awan abu per lapisan terbang (FL050, FL100, FL140, FL200+)',
      'Estimasi ketinggian puncak abu (Ash Top m ASL / Flight Level)',
      'Arah dan kecepatan laju abu di atmosfer bebas',
      'Prakiraan posisi abu untuk +6 jam, +12 jam, dan +18 jam',
    ],
  },
  {
    id: 'noaa_gfs',
    name: 'NOAA NCEP GFS (Global Forecast System)',
    agency: 'National Oceanic and Atmospheric Administration, USA',
    role: 'Profil Angin Vertikal Atmosfer (Multilapis Isobarik)',
    dataType: 'Model Numerik Global GFS 0.25° (Isobarik: 1000, 925, 850, 700, 500, 300 hPa)',
    cadence: '4 Siklus Pemodelan per Hari (00z, 06z, 12z, 18z)',
    format: 'GRIB2, OPeNDAP, NOMADS Open Data',
    confidence: 'Tinggi (Ground Truth)',
    confidenceColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    endpoint: 'https://nomads.ncep.noaa.gov/',
    legalStatus: 'Disetujui — Public Domain NOAA Data Policy',
    description:
      'Letusan vulkanik melontarkan abu ke ketinggian ribuan meter, di mana arah angin di atas sering berbeda 180 derajat dibanding angin di darat (wind shear). Data GFS memungkinkan analisis arah tiupan angin di setiap lapisan tekanan atmosfer dari dekat tanah hingga stratosfer.',
    parameters: [
      'Komponen angin U (Barat-Timur) dan V (Selatan-Utara) pada level isobarik',
      'Kecepatan angin (m/s dan knot)',
      'Tinggi geopotensial lapisan atmosfer (gpm)',
      'Suhu udara dan profil stabilitas atmosfer vertikal',
    ],
  },
  {
    id: 'hysplit',
    name: 'Model Dispersi & Trayektori HYSPLIT',
    agency: 'Air Resources Laboratory (ARL) — NOAA / Simulasi Lokal',
    role: 'Simulasi Numerik Perjalanan Partikel & Footprint Probabilistik',
    dataType: 'Trayektori Partikel Maju (Forward Trajectory) & Footprint Dispersi Wilayah',
    cadence: 'Dijalankan Sesuai Waktu Onset Kejadian Erupsi',
    format: 'GeoJSON Polygon, Trayektori Jalur Koordinat',
    confidence: 'Simulasi (Indikasi Model)',
    confidenceColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    endpoint: 'Kalkulasi Internal / Unit Source Screening',
    legalStatus: 'Indikasi Ilmiah — Non-Otoritatif (Simulasi Komputer)',
    description:
      'HYSPLIT menghitung perjalanan jutaan partikel abu yang tertiup angin selama rentang 12–24 jam. Hasilnya berupa arsiran oranye (footprint model) yang memperkirakan probabilitas wilayah kabupaten yang berpotensi terlintasi awan abu vulkanik.',
    parameters: [
      'Garis trayektori pergerakan partikel abu selama 12–24 jam',
      'Footprint poligon probabilitas sebaran relatif (0%–100%)',
      'Rasio estimasi paparan wilayah administratif (kabupaten/kota)',
      'Estimasi waktu kedatangan partikel abu (ETA) di wilayah tertentu',
    ],
  },
  {
    id: 'esri_osm',
    name: 'ESRI World Imagery & Peta Wilayah Indonesia',
    agency: 'Esri, Maxar, Earthstar Geographics & OpenStreetMap Contributors',
    role: 'Basemap Citra Satelit Bumi & Batas Wilayah Bebas Watermark',
    dataType: 'Peta Satelit Resolusi Tinggi (Tile Raster) & Label Referensi Tempat Bebas Lisensi Kunci',
    cadence: 'Terkini / Diperbarui Secara Berkala',
    format: 'Tile Map Service (TMS / Slippy Tiles XYZ)',
    confidence: 'Tinggi (Ground Truth)',
    confidenceColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    endpoint: 'https://server.arcgisonline.com/',
    legalStatus: 'Disetujui — Akses Publik Terbuka Tanpa Watermark',
    description:
      'Menampilkan kontur geografis kepulauan Indonesia secara realistis dengan warna satelit alami, memudahkan masyarakat melihat posisi kaldera, lereng gunung, laut, pulau, dan batas perkotaan.',
    parameters: [
      'Citra satelit optik bumi resolusi tinggi',
      'Label toponimi kota, kabupaten, dan batas negara',
      '100% bebas watermark & tanpa kewajiban kunci berbayar',
    ],
  },
]

export function DataSourceInfoDialog({ open, onOpenChange }: DataSourceInfoDialogProps) {
  const [sizeMode, setSizeMode] = useState<'standard' | 'wide' | 'fullscreen'>('wide')
  const [selectedSourceId, setSelectedSourceId] = useState<string>('pvmbg')

  const SIZE_CONFIG = {
    standard: {
      className: 'sm:max-w-2xl max-w-2xl',
      width: 'min(94vw, 700px)',
      maxWidth: '700px',
      height: '80vh',
      maxHeight: '82vh',
    },
    wide: {
      className: 'sm:max-w-5xl max-w-5xl',
      width: 'min(95vw, 1150px)',
      maxWidth: '1150px',
      height: '88vh',
      maxHeight: '88vh',
    },
    fullscreen: {
      className: 'sm:max-w-[98vw] max-w-[98vw]',
      width: '98vw',
      maxWidth: '98vw',
      height: '95vh',
      maxHeight: '95vh',
    },
  }

  const selectedSource = DATA_SOURCES.find((s) => s.id === selectedSourceId) || DATA_SOURCES[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${SIZE_CONFIG[sizeMode].className} flex flex-col p-0 gap-0 overflow-hidden transition-all duration-200 border-border bg-card shadow-2xl rounded-xl`}
        style={{
          width: SIZE_CONFIG[sizeMode].width,
          maxWidth: SIZE_CONFIG[sizeMode].maxWidth,
          height: SIZE_CONFIG[sizeMode].height,
          maxHeight: SIZE_CONFIG[sizeMode].maxHeight,
        }}
      >
        {/* HEADER MODAL SUMBER DATA */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card/90 backdrop-blur shrink-0 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-semibold leading-tight tracking-tight">
                  Informasi Deskriptif Jenis &amp; Sumber Data
                </DialogTitle>
                <span className="rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 font-medium">
                  Transparansi Ilmiah &bull; Resmi
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground truncate mt-0.5">
                Katalog lengkap feed data kebencanaan, meteorologi, ruang udara, dan model dispersi
              </DialogDescription>
            </div>
          </div>

          {/* KONTROL UKURAN JENDELA */}
          <div className="flex items-center gap-1 mr-6 shrink-0 bg-muted/60 p-1 rounded-lg border border-border">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 text-xs px-2.5 rounded-md transition-all ${
                sizeMode === 'standard'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSizeMode('standard')}
              title="Ukuran Standar"
            >
              Standar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 text-xs px-2.5 rounded-md transition-all ${
                sizeMode === 'wide'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSizeMode('wide')}
              title="Ukuran Lebar"
            >
              Lebar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 text-xs px-2.5 rounded-md gap-1.5 transition-all ${
                sizeMode === 'fullscreen'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSizeMode((m) => (m === 'fullscreen' ? 'wide' : 'fullscreen'))}
              title={sizeMode === 'fullscreen' ? 'Kecilkan' : 'Layar Penuh'}
            >
              {sizeMode === 'fullscreen' ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Kecilkan</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Perbesar Penuh</span>
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* CONTAINER UTAMA: DAFTAR SUMBER (KIRI) + DETAIL SPESIFIKASI (KANAN) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* LIST KIRI SUMBER DATA */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col min-h-0 overflow-hidden">
            <div className="p-3 border-b border-border bg-card/40 shrink-0">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Daftar Lembaga &amp; Konektor Data
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Klik salah satu untuk membaca spesifikasi teknis
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {DATA_SOURCES.map((source) => {
                const isSelected = selectedSourceId === source.id
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSourceId(source.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-card border-2 border-primary/60 shadow-sm text-foreground'
                        : 'border border-border/60 bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-foreground text-xs">{source.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${source.confidenceColor}`}
                      >
                        {source.confidence.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{source.role}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {source.cadence.split(' ')[0]}
                      </span>
                      <span>&bull;</span>
                      <span className="font-mono">{source.format.split(',')[0]}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Catatan Legalitas Ringkas */}
            <div className="p-3 border-t border-border bg-card/60 shrink-0 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Kepatuhan Regulasi
              </div>
              <p className="text-[10px] leading-relaxed">
                Data kebencanaan dan meteorologi diselaraskan dengan UU No. 24/2007 dan UU No. 31/2009.
              </p>
            </div>
          </div>

          {/* DETAIL KANAN SUMBER DATA TERPILIH */}
          <div className="flex-1 overflow-y-auto p-5 lg:p-6 bg-card space-y-5">
            {/* Header Spesifikasi Sumber */}
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-foreground">{selectedSource.name}</h3>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border ${selectedSource.confidenceColor}`}
                >
                  Status: {selectedSource.confidence}
                </span>
              </div>
              <div className="text-xs font-medium text-primary">{selectedSource.agency}</div>
              <p className="text-xs text-muted-foreground">{selectedSource.role}</p>
            </div>

            {/* Uraian Deskriptif Peran Data */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary" /> Deskripsi &amp; Peran Data dalam Aplikasi
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3.5 rounded-xl border border-border">
                {selectedSource.description}
              </p>
            </div>

            {/* Parameter Data yang Diambil */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" /> Parameter &amp; Atribut yang Dihasilkan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedSource.parameters.map((param, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-border bg-card/60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground text-[11px]">{param}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabel Spesifikasi Teknis */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-primary" /> Spesifikasi Teknis &amp; Protokol Integrasi
              </h4>
              <div className="rounded-xl border border-border overflow-hidden text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border bg-muted/15">
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Frekuensi Pembaruan
                    </span>
                    <div className="font-semibold text-foreground">{selectedSource.cadence}</div>
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Format Pertukaran Data
                    </span>
                    <div className="font-semibold text-foreground font-mono">
                      {selectedSource.format}
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Status Legalitas / Lisensi
                    </span>
                    <div className="font-semibold text-emerald-400">
                      {selectedSource.legalStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tautan Dokumentasi Resmi */}
            {selectedSource.endpoint.startsWith('http') && (
              <div className="pt-2 flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5">
                <div className="text-xs">
                  <span className="font-medium text-foreground">Portal Resmi Sumber Data:</span>
                  <div className="text-[11px] text-muted-foreground font-mono truncate max-w-md">
                    {selectedSource.endpoint}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs shrink-0"
                  onClick={() => window.open(selectedSource.endpoint, '_blank')}
                >
                  Kunjungi Sumber <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER MODAL */}
        <div className="px-5 py-2.5 border-t border-border bg-muted/30 shrink-0 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Fusi Bukti Ilmiah &bull; Saling Mengonfirmasi &bull; Transparan</span>
          </div>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
