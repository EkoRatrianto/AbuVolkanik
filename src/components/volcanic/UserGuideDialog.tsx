'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Info,
  Map as MapIcon,
  MousePointerClick,
  ShieldAlert,
  HelpCircle,
  Maximize2,
  Minimize2,
  ExternalLink,
  Wind,
  Layers,
  AlertTriangle,
  HeartHandshake,
  Search,
  CheckCircle2,
  ArrowRight,
  Compass,
  PhoneCall,
  Activity,
  ChevronRight,
  Eye,
  Sparkles,
} from 'lucide-react'

interface UserGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type GuideTopicId = 'ringkasan' | 'peta' | 'langkah' | 'keselamatan' | 'istilah' | 'faq'

interface GuideTopic {
  id: GuideTopicId
  title: string
  shortTitle: string
  desc: string
  icon: typeof Info
  badge?: string
}

const TOPICS: GuideTopic[] = [
  {
    id: 'ringkasan',
    title: '1. Peringatan Penting & Sumber Resmi',
    shortTitle: 'Peringatan & Sumber',
    desc: 'Arti label Indikasi Model dan otoritas berwenang',
    icon: Info,
    badge: 'Wajib Baca',
  },
  {
    id: 'peta',
    title: '2. Cara Membaca Simbol Peta',
    shortTitle: 'Simbol Peta',
    desc: 'Warna status gunung, arsiran abu, dan panah angin',
    icon: MapIcon,
  },
  {
    id: 'langkah',
    title: '3. Langkah Penggunaan Aplikasi',
    shortTitle: 'Cara Pakai',
    desc: 'Panduan 3 langkah memilih kejadian dan membaca data',
    icon: MousePointerClick,
  },
  {
    id: 'keselamatan',
    title: '4. Panduan Keselamatan Hujan Abu',
    shortTitle: 'Keselamatan',
    desc: 'Protokol masker N95, pelindung mata, dan tandon air',
    icon: ShieldAlert,
    badge: 'Kesehatan',
  },
  {
    id: 'istilah',
    title: '5. Kamus Istilah Awam (Glosarium)',
    shortTitle: 'Kamus Istilah',
    desc: 'Penjelasan istilah VONA, VAAC, FL, ASL, dan hPa',
    icon: HelpCircle,
  },
  {
    id: 'faq',
    title: '6. Pertanyaan Sering Diajukan (FAQ)',
    shortTitle: 'FAQ Umum',
    desc: 'Jawaban atas keraguan umum warga',
    icon: Compass,
  },
]

export function UserGuideDialog({ open, onOpenChange }: UserGuideDialogProps) {
  // Mode luasan layar: standard, wide, fullscreen
  const [sizeMode, setSizeMode] = useState<'standard' | 'wide' | 'fullscreen'>('wide')
  const [activeTopic, setActiveTopic] = useState<GuideTopicId>('ringkasan')
  const [searchQuery, setSearchQuery] = useState('')

  // Luasan layar responsif
  const sizeClasses = {
    standard: 'max-w-2xl max-h-[85vh] w-[95vw]',
    wide: 'max-w-5xl max-h-[90vh] w-[95vw]',
    fullscreen: 'max-w-[98vw] w-[98vw] h-[94vh] max-h-[94vh]',
  }

  // Filter topik jika pengguna mencari kata kunci
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return TOPICS
    const q = searchQuery.toLowerCase()
    return TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.shortTitle.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const currentTopic = TOPICS.find((t) => t.id === activeTopic) || TOPICS[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${sizeClasses[sizeMode]} flex flex-col p-0 overflow-hidden transition-all duration-200 border-border bg-card shadow-2xl rounded-xl`}
      >
        {/* TOPBAR HEADER DIALOG */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card/90 backdrop-blur shrink-0 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30 shadow-xs">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-semibold leading-tight tracking-tight">
                  Buku Panduan &amp; Edukasi Abu Vulkanik
                </DialogTitle>
                <span className="rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] px-2 py-0.5 font-medium">
                  Bahasa Awam &bull; Praktis
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground truncate mt-0.5">
                Panduan praktis masyarakat membaca peta sebaran abu, kode penerbangan, dan keselamatan
              </DialogDescription>
            </div>
          </div>

          {/* KONTROL UKURAN JENDELA (Luasan Layar Fleksibel) */}
          <div className="flex items-center gap-1.5 mr-6 shrink-0 bg-muted/40 p-1 rounded-lg border border-border">
            <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline px-1">
              Luas:
            </span>
            <Button
              variant={sizeMode === 'standard' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-6 text-xs px-2 ${sizeMode === 'standard' ? 'shadow-xs font-medium' : ''}`}
              onClick={() => setSizeMode('standard')}
              title="Ukuran Standar"
            >
              Standar
            </Button>
            <Button
              variant={sizeMode === 'wide' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-6 text-xs px-2 ${sizeMode === 'wide' ? 'shadow-xs font-medium' : ''}`}
              onClick={() => setSizeMode('wide')}
              title="Ukuran Lebar (Rekomendasi Laptop)"
            >
              Lebar
            </Button>
            <Button
              variant={sizeMode === 'fullscreen' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-6 text-xs px-2 gap-1 ${sizeMode === 'fullscreen' ? 'shadow-xs font-medium' : ''}`}
              onClick={() => setSizeMode(sizeMode === 'fullscreen' ? 'wide' : 'fullscreen')}
              title="Layar Penuh"
            >
              {sizeMode === 'fullscreen' ? (
                <>
                  <Minimize2 className="h-3 w-3" />
                  <span className="hidden md:inline">Kecilkan</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3" />
                  <span className="hidden md:inline">Penuh</span>
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* CONTAINER UTAMA: SIDEBAR NAVIGASI + KONTEN BACAAN */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* SIDEBAR NAVIGASI KIRI (Desktop & Tablet) */}
          <nav
            aria-label="Daftar Bab Panduan"
            className="w-full md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col min-h-0 overflow-hidden"
          >
            {/* Kotak Pencarian Topik */}
            <div className="p-3 border-b border-border bg-card/40 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari topik atau istilah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background/80"
                />
              </div>
            </div>

            {/* Daftar Menu Topik Navigasi */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTopics.map((topic) => {
                const Icon = topic.icon
                const isActive = activeTopic === topic.id
                return (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-primary/15 text-primary border border-primary/30 font-medium shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-foreground truncate">
                          {topic.shortTitle}
                        </span>
                        {topic.badge && (
                          <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {topic.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {topic.desc}
                      </p>
                    </div>
                  </button>
                )
              })}

              {filteredTopics.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Tidak ada topik yang sesuai dengan &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>

            {/* Kontak Darurat Singkat di Kaki Sidebar */}
            <div className="p-3 border-t border-border bg-card/60 shrink-0 text-[11px] space-y-1.5 hidden md:block">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400" /> Kontak Resmi Otoritas
              </div>
              <div className="space-y-1 text-muted-foreground text-[10px]">
                <p>&bull; PVMBG (Badan Geologi): magma.esdm.go.id</p>
                <p>&bull; BMKG Call Center: 196</p>
                <p>&bull; BNPB Darurat: 117</p>
              </div>
            </div>
          </nav>

          {/* AREA KONTEN BACAAN KANAN */}
          <main className="flex-1 overflow-y-auto p-5 lg:p-6 bg-card space-y-5">
            {/* Banner Judul Bab Saat Ini */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                  {currentTopic.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{currentTopic.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline font-mono">Bab {TOPICS.findIndex((t) => t.id === activeTopic) + 1} dari {TOPICS.length}</span>
              </div>
            </div>

            {/* ============================================================== */}
            {/* BAB 1: RINGKASAN & PERINGATAN PENTING                          */}
            {/* ============================================================== */}
            {activeTopic === 'ringkasan' && (
              <div className="space-y-5 text-sm">
                {/* Kotak Peringatan Utama */}
                <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-amber-200 text-sm">
                        PERINGATAN PENGGUNAAN RESMI (MANDATORI)
                      </h3>
                      <p className="text-xs text-amber-100/95 leading-relaxed">
                        Aplikasi ini merupakan <strong>alat simulasi fusi bukti meteorologis dan vulkanik</strong>.
                        Seluruh visualisasi sebaran awan debu dan wilayah terdampak berstatus{' '}
                        <span className="font-bold underline text-amber-200">INDIKASI MODEL</span>{' '}
                        (hasil kalkulasi komputer HYSPLIT dan model angin NOAA/BMKG),{' '}
                        <strong>BUKAN fakta kejadian di lapangan atau peringatan resmi dari pemerintah</strong>.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-700/50 text-[11px] text-amber-200">
                          <strong>&ldquo;Berpotensi Terlintasi&rdquo;</strong> &ne; Wilayah tersebut pasti mengalami hujan abu lebat.
                        </div>
                        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-700/50 text-[11px] text-amber-200">
                          <strong>&ldquo;Tidak Ada Data&rdquo;</strong> &ne; Wilayah tersebut dijamin bebas dari paparan abu.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tiga Pilar Sistem */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                      <Activity className="h-4 w-4" /> 1. Input Letusan Resmi
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mengambil dokumen VONA (Volcano Observatory Notice for Aviation) resmi dari pos pengamatan PVMBG Badan Geologi.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                      <Wind className="h-4 w-4" /> 2. Medan Angin Atmosfer
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Memanfaatkan data angin multilapis dari model meteorologi GFS (NOAA) &amp; Open-Meteo pada berbagai ketinggian (1.000&ndash;300 hPa).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 text-fuchsia-400 font-semibold text-xs">
                      <Layers className="h-4 w-4" /> 3. Ruang Udara VAAC
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mengintegrasikan batas ruang udara peringatan abu dari VAAC Darwin (Biro Meteorologi Australia) untuk rute penerbangan.
                    </p>
                  </div>
                </div>

                {/* Tautan Otoritas Resmi */}
                <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-emerald-400" /> Kanal Resmi Rujukan Utama Indonesia:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <a
                      href="https://magma.esdm.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-foreground">MAGMA Indonesia</div>
                        <div className="text-[10px] text-muted-foreground">PVMBG - Badan Geologi</div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                    <a
                      href="https://www.bmkg.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-foreground">BMKG Pusat</div>
                        <div className="text-[10px] text-muted-foreground">Prakiraan Cuaca &amp; Angin</div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                    <a
                      href="https://bnpb.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-foreground">BNPB / BPBD</div>
                        <div className="text-[10px] text-muted-foreground">Penanganan Bencana &amp; Evakuasi</div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setActiveTopic('peta')}
                    className="gap-1.5 text-xs"
                  >
                    Lanjut: Cara Membaca Simbol Peta <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* BAB 2: CARA MEMBACA SIMBOL PETA                                */}
            {/* ============================================================== */}
            {activeTopic === 'peta' && (
              <div className="space-y-5 text-sm">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Peta ini memadukan citra satelit bumi asli dengan lapisan informasi erupsi.
                  Berikut adalah panduan membaca arti setiap simbol dan warna:
                </p>

                {/* Status Warna Gunung Api */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    1. Kode Warna Penerbangan Gunung Api (Aviation Color Code)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 shrink-0 shadow-xs" />
                        <span className="font-bold text-emerald-300 text-xs">HIJAU (Green)</span>
                      </div>
                      <div className="text-xs font-medium text-foreground">Level I (Normal)</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Gunung api tenang. Tidak ada indikasi letusan dalam waktu dekat. Jalur penerbangan normal.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full bg-amber-300 shrink-0 shadow-xs" />
                        <span className="font-bold text-amber-200 text-xs">KUNING (Yellow)</span>
                      </div>
                      <div className="text-xs font-medium text-foreground">Level II (Waspada)</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Aktivitas vulkanik di atas normal. Waspadai peningkatan gempa vulkanik atau hembusan asap kawah.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full bg-orange-400 shrink-0 shadow-xs" />
                        <span className="font-bold text-orange-200 text-xs">ORANYE (Orange)</span>
                      </div>
                      <div className="text-xs font-medium text-foreground">Level III (Siaga)</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Erupsi sedang berlangsung dengan semburan abu terukur, atau potensi erupsi tinggi dalam waktu dekat.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full bg-red-400 shrink-0 shadow-xs" />
                        <span className="font-bold text-red-200 text-xs">MERAH (Red)</span>
                      </div>
                      <div className="text-xs font-medium text-foreground">Level IV (Awas)</div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Letusan eksplosif berskala besar sedang terjadi. Kolom abu membubung tinggi dan mengancam rute pesawat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simbol Layer Peta */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    2. Lapisan Gambar &amp; Poligon di Peta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                      <div
                        className="h-9 w-12 rounded-lg border border-orange-400/80 bg-orange-400/20 shrink-0 flex items-center justify-center font-mono text-orange-300 text-xs"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(251,146,60,0.4) 3px, rgba(251,146,60,0.4) 5px)',
                        }}
                      >
                        {'///'}
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">
                          Arsiran Oranye (Footprint Model HYSPLIT)
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Menunjukkan daerah yang diperhitungkan oleh komputer berpotensi dilintasi partikel abu selama rentang waktu model berlangsung.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                      <div className="h-9 w-12 rounded-lg border-2 border-fuchsia-400 bg-fuchsia-400/15 shrink-0 flex items-center justify-center font-bold text-fuchsia-300 text-[10px]">
                        VAAC
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">
                          Poligon Garis Magenta/Ungu (Advisory VAAC)
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Batas sebaran abu di ketinggian langit yang dilaporkan resmi oleh VAAC Darwin kepada seluruh pilot pesawat komersial internasional.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                      <div className="h-9 w-12 rounded-lg border border-border bg-muted/40 shrink-0 flex items-center justify-center">
                        <span className="border-t-2 border-dashed border-amber-300 w-8 inline-block" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">
                          Garis Kuning Putus-Putus (Trayektori Angin)
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Garis lintasan partikel abu yang terbawa oleh arus angin dari puncak kawah gunung menuju arah tertentu selama 12&ndash;24 jam.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                      <div className="h-9 w-12 rounded-lg border border-sky-400/40 bg-sky-400/15 shrink-0 flex items-center justify-center text-sky-300">
                        <Wind className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">
                          Panah Angin Grid Nasional
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Arah panah = arah angin bertiup. Warna panah = kecepatan angin: abu-abu (&lt;4 m/s), kuning (4&ndash;8 m/s), oranye/merah (&gt;8 m/s).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTopic('ringkasan')}
                    className="text-xs"
                  >
                    Kembali
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveTopic('langkah')}
                    className="gap-1.5 text-xs"
                  >
                    Lanjut: Langkah Penggunaan <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* BAB 3: LANGKAH PENGGUNAAN                                      */}
            {/* ============================================================== */}
            {activeTopic === 'langkah' && (
              <div className="space-y-5 text-sm">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ikuti 3 langkah mudah berikut untuk membaca data letusan abu vulkanik di Indonesia:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Langkah 1 */}
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs">
                        1
                      </span>
                      <span className="font-semibold text-xs text-foreground">Pilih Kejadian Erupsi</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Buka panel di sebelah kiri. Pilih letusan aktif seperti <strong>Semeru</strong>,{' '}
                      <strong>Lewotobi</strong>, atau <strong>Anak Krakatau</strong>.
                    </p>
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground">
                      💡 Jika panel kiri tertutup, klik tombol <strong>&ldquo;Kejadian Vulkanik&rdquo;</strong> di pojok kiri atas peta.
                    </div>
                  </div>

                  {/* Langkah 2 */}
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs">
                        2
                      </span>
                      <span className="font-semibold text-xs text-foreground">Atur Layer di Legenda</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Gunakan kotak Legenda di pojok kanan untuk menyalakan/mematikan arah angin, arsiran model, atau advisory penerbangan VAAC.
                    </p>
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground">
                      💡 Klik tombol panah atas/bawah di Legenda untuk memindahkannya antara pojok atas atau bawah peta.
                    </div>
                  </div>

                  {/* Langkah 3 */}
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs">
                        3
                      </span>
                      <span className="font-semibold text-xs text-foreground">Buka Lembar Detail</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Klik tombol <strong>&ldquo;Detail&rdquo;</strong> untuk membaca dokumen VONA lengkap, tinggi kolom abu, dan kabupaten yang berpotensi dilintasi.
                    </p>
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground">
                      💡 Di dalam detail juga tersedia grafik profil angin vertikal di setiap lapisan ketinggian.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTopic('peta')}
                    className="text-xs"
                  >
                    Kembali
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveTopic('keselamatan')}
                    className="gap-1.5 text-xs"
                  >
                    Lanjut: Panduan Keselamatan <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* BAB 4: PANDUAN KESELAMATAN HUJAN ABU                            */}
            {/* ============================================================== */}
            {activeTopic === 'keselamatan' && (
              <div className="space-y-5 text-sm">
                <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-red-300 font-semibold text-xs">
                    <ShieldAlert className="h-4 w-4" /> Bahaya Abu Vulkanik Bagi Tubuh Manusia
                  </div>
                  <p className="text-xs text-red-100/90 leading-relaxed">
                    Abu vulkanik bukanlah abu kayu yang lembut, melainkan serpihan batuan silika runcing mikroskopis yang bersifat keras dan abrasif. Bila terhirup atau terkena mata dapat memicu iritasi berat dan gangguan pernapasan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      😷 1. Wajib Masker Standar N95
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Gunakan masker N95 atau masker bedah rangkap. Jika berada dalam kondisi darurat tanpa masker medis, gunakan kain tebal yang dibasahi sedikit air untuk menyaring partikel debu halus.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      👓 2. Lindungi Mata (Lepas Lensa Kontak)
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Gunakan kacamata pelindung tertutup (*goggles*). <strong>DILARANG MEMAKAI SOFTLENS</strong> saat hujan abu karena butiran abu bisa terjepit di balik lensa dan merobek kornea mata.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      💧 3. Lindungi Pasokan Air Minum
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Tutup rapat semua sumur, tandon air, kolam, dan ember penampungan. Abu vulkanik mengandung asam dan belerang yang dapat meracuni air jika tercampur.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      🏠 4. Tetap Di Dalam Rumah &amp; Bersihkan Atap
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Tutup pintu dan jendela rapat-rapat. Bersihkan atap rumah secara bertahap jika abu menumpuk tebal untuk menghindari atap ambruk karena beban berat abu saat terkena hujan.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTopic('langkah')}
                    className="text-xs"
                  >
                    Kembali
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveTopic('istilah')}
                    className="gap-1.5 text-xs"
                  >
                    Lanjut: Kamus Istilah Awam <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* BAB 5: KAMUS ISTILAH AWAM                                      */}
            {/* ============================================================== */}
            {activeTopic === 'istilah' && (
              <div className="space-y-4 text-sm">
                <p className="text-xs text-muted-foreground">
                  Daftar singkatan dan istilah ilmiah yang sering muncul dalam laporan letusan:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                    <div className="font-mono font-semibold text-primary">VONA</div>
                    <div className="font-medium text-foreground">Volcano Observatory Notice for Aviation</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Surat edaran resmi PVMBG mengenai ketinggian letusan dan arah abu untuk keamanan pesawat.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                    <div className="font-mono font-semibold text-primary">VAAC</div>
                    <div className="font-medium text-foreground">Volcanic Ash Advisory Centre</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Badan internasional (VAAC Darwin) yang memantau abu vulkanik di ruang udara Indonesia dan Australia.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                    <div className="font-mono font-semibold text-primary">m ASL</div>
                    <div className="font-medium text-foreground">Meter Above Sea Level (Meter di Atas Permukaan Laut)</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Tinggi total puncak atau kolom abu dihitung dari permukaan laut rata-rata.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                    <div className="font-mono font-semibold text-primary">FL / Flight Level</div>
                    <div className="font-medium text-foreground">Tingkat Ketinggian Terbang Pesawat</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Contoh: FL140 = 14.000 kaki (&plusmn;4.267 meter dpl). Membantu pilot mengatur ketinggian jelajah.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                    <div className="font-mono font-semibold text-primary">hPa (Hektopaskal)</div>
                    <div className="font-medium text-foreground">Tekanan Udara Atmosfer</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Makin tinggi posisi di atmosfer, tekanan makin turun: 850 hPa (&plusmn;1,5 km), 500 hPa (&plusmn;5,6 km), 300 hPa (&plusmn;9,2 km).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                    <div className="font-mono font-semibold text-primary">HYSPLIT</div>
                    <div className="font-medium text-foreground">Model Trayektori Partikel NOAA</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Program komputer ilmiah untuk mensimulasikan ke mana partikel debu abu ditiup oleh angin.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTopic('keselamatan')}
                    className="text-xs"
                  >
                    Kembali
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveTopic('faq')}
                    className="gap-1.5 text-xs"
                  >
                    Lanjut: Tanya Jawab Umum <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* BAB 6: FAQ (PERTANYAAN UMUM)                                   */}
            {/* ============================================================== */}
            {activeTopic === 'faq' && (
              <div className="space-y-4 text-sm">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1.5">
                    <h4 className="font-semibold text-foreground text-xs">
                      T: Mengapa arah angin di tanah berbeda dengan arah abu di langit?
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      J: Di atmosfer bumi terjadi geseran angin (*wind shear*). Angin di permukaan tanah (1.000 hPa) sering bertiup ke arah barat, namun di ketinggian jelajah letusan (500&ndash;300 hPa) angin bisa berhembus kencang ke timur laut. Aplikasi ini memperhitungkan profil vertikal multilapis untuk akurasi yang lebih baik.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1.5">
                    <h4 className="font-semibold text-foreground text-xs">
                      T: Apakah jika kabupaten saya masuk dalam arsiran oranye, saya harus langsung mengungsi?
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      J: <strong>Tidak serta-merta</strong>. Arsiran oranye adalah perkiraan komputer (*Indikasi Model*). Evakuasi dan pengungsian hanya dilakukan apabila ada perintah resmi dari BPBD, BNPB, atau pemerintah daerah setempat.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1.5">
                    <h4 className="font-semibold text-foreground text-xs">
                      T: Seberapa sering data di aplikasi ini diperbarui?
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      J: Daftar kejadian disinkronkan secara otomatis setiap 60 detik dari data server. Anda juga dapat menekan tombol <strong>&ldquo;Refresh&rdquo;</strong> di atas panel kejadian kapan saja.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTopic('istilah')}
                    className="text-xs"
                  >
                    Kembali
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="gap-1.5 text-xs"
                  >
                    Tutup Panduan &amp; Mulai Pantau Peta
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* FOOTER BAR DIALOG */}
        <div className="px-5 py-2.5 border-t border-border bg-muted/30 shrink-0 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Dokumentasi Pemantauan Abu Vulkanik &bull; Terbuka untuk Publik</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
