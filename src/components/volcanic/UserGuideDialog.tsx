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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
} from 'lucide-react'

interface UserGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserGuideDialog({ open, onOpenChange }: UserGuideDialogProps) {
  // Mode luasan layar: standard (medium), wide (lebar), fullscreen (layar penuh)
  const [sizeMode, setSizeMode] = useState<'standard' | 'wide' | 'fullscreen'>('wide')
  const [activeTab, setActiveTab] = useState('ringkasan')

  const sizeClasses = {
    standard: 'max-w-2xl max-h-[85vh]',
    wide: 'max-w-4xl max-h-[90vh]',
    fullscreen: 'max-w-[96vw] w-[96vw] h-[92vh] max-h-[92vh]',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${sizeClasses[sizeMode]} flex flex-col p-0 overflow-hidden transition-all duration-200 border-border bg-card`}
      >
        {/* Header Dialog dengan kontrol luasan layar */}
        <DialogHeader className="px-5 py-3.5 border-b border-border bg-muted/30 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-tight flex items-center gap-2">
                Panduan Penggunaan Aplikasi
                <span className="rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] px-1.5 py-0.2 font-mono">
                  Untuk Warga &amp; Umum
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Penjelasan mudah membaca peta, status gunung api, dan simulasi sebaran abu vulkanik
              </DialogDescription>
            </div>
          </div>

          {/* Kontrol Fleksibilitas Luasan Layar */}
          <div className="flex items-center gap-1.5 mr-6 shrink-0">
            <span className="text-[10px] text-muted-foreground hidden sm:inline mr-1">
              Luasan Layar:
            </span>
            <Button
              variant={sizeMode === 'standard' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setSizeMode('standard')}
              title="Ukuran Standar"
            >
              Standar
            </Button>
            <Button
              variant={sizeMode === 'wide' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setSizeMode('wide')}
              title="Ukuran Lebar"
            >
              Lebar
            </Button>
            <Button
              variant={sizeMode === 'fullscreen' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setSizeMode(sizeMode === 'fullscreen' ? 'wide' : 'fullscreen')}
              title="Layar Penuh"
            >
              {sizeMode === 'fullscreen' ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Tab Konten Panduan */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="px-5 pt-2.5 pb-2 border-b border-border bg-background/50 overflow-x-auto">
            <TabsList className="h-8 bg-muted/60 p-0.5 gap-1">
              <TabsTrigger value="ringkasan" className="h-7 text-xs px-3 gap-1.5">
                <Info className="h-3.5 w-3.5" /> 1. Ringkasan &amp; Peringatan
              </TabsTrigger>
              <TabsTrigger value="peta" className="h-7 text-xs px-3 gap-1.5">
                <MapIcon className="h-3.5 w-3.5" /> 2. Cara Membaca Simbol Peta
              </TabsTrigger>
              <TabsTrigger value="fitur" className="h-7 text-xs px-3 gap-1.5">
                <MousePointerClick className="h-3.5 w-3.5" /> 3. Langkah Penggunaan
              </TabsTrigger>
              <TabsTrigger value="keselamatan" className="h-7 text-xs px-3 gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> 4. Tindakan Keselamatan
              </TabsTrigger>
              <TabsTrigger value="istilah" className="h-7 text-xs px-3 gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> 5. Kamus Istilah Awam
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5 text-sm space-y-4">
            {/* TAB 1: RINGKASAN & PERINGATAN */}
            <TabsContent value="ringkasan" className="m-0 space-y-4">
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-200 text-sm">
                      Hal Terpenting Yang Wajib Diketahui:
                    </h3>
                    <p className="mt-1 text-xs text-amber-100/90 leading-relaxed">
                      Aplikasi ini adalah sistem <strong>simulasi fusi bukti ilmiah</strong> dan
                      berstatus <strong className="text-amber-200">INDIKASI MODEL</strong>.
                      Aplikasi ini <strong>BUKAN pengganti peringatan resmi pemerintah</strong> atau
                      instruksi evakuasi resmi.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-amber-200 font-mono">
                      <span className="rounded bg-amber-950/60 px-2 py-0.5 border border-amber-700/50">
                        &bull; &ldquo;Berpotensi terlintasi&rdquo; &ne; Pasti terkena hujan abu
                      </span>
                      <span className="rounded bg-amber-950/60 px-2 py-0.5 border border-amber-700/50">
                        &bull; &ldquo;Tidak ada data&rdquo; &ne; Dijamin aman dari abu
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card/60 p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> Apa Fungsi Aplikasi Ini?
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Aplikasi ini membantu masyarakat, pemerhati bencana, dan penerbang untuk melihat
                    kemana abu vulkanik diperkirakan terbang terbawa angin setelah gunung meletus.
                    Data disintesis dari:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>
                      <strong>PVMBG / Magma Indonesia:</strong> Laporan letusan &amp; VONA resmi.
                    </li>
                    <li>
                      <strong>BMKG &amp; NOAA (GFS):</strong> Prakiraan arah &amp; kecepatan angin di
                      berbagai lapisan atmosfer.
                    </li>
                    <li>
                      <strong>VAAC Darwin:</strong> Pengamatan ruang udara abu untuk keselamatan
                      penerbangan internasional.
                    </li>
                    <li>
                      <strong>Model HYSPLIT:</strong> Simulasi komputer trayektori partikel abu.
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card/60 p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <HeartHandshake className="h-3.5 w-3.5" /> Kapan Harus Merujuk Sumber Resmi?
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Untuk keputusan evakuasi, penutupan bandara, pengungsian, dan status bahaya
                    resmi, selalu rujuk kanal otoritas resmi Republik Indonesia:
                  </p>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <a
                      href="https://magma.esdm.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 rounded bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <span className="font-medium text-foreground">
                        MAGMA Indonesia (PVMBG - Badan Geologi)
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                    <a
                      href="https://www.bmkg.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 rounded bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <span className="font-medium text-foreground">
                        BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                    <a
                      href="https://bnpb.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 rounded bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <span className="font-medium text-foreground">
                        BNPB / BPBD Daerah Terkait
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: CARA MEMBACA SIMBOL PETA */}
            <TabsContent value="peta" className="m-0 space-y-4">
              <div className="text-xs text-muted-foreground">
                Peta ini menggunakan citra satelit permukaan bumi dengan beberapa lapisan informasi
                visual. Berikut panduan warna dan arti simbolnya:
              </div>

              {/* Status Warna Gunung Api */}
              <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  Titik Gunung Api &amp; Kode Warna Penerbangan (Aviation Color Code)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-semibold text-emerald-300 text-xs">HIJAU (Green)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <strong>Level I (Normal):</strong> Gunung dalam keadaan tenang, tidak ada tanda
                      letusan dalam waktu dekat.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-300 shrink-0" />
                      <span className="font-semibold text-amber-200 text-xs">KUNING (Yellow)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <strong>Level II (Waspada):</strong> Aktivitas di atas normal. Waspadai adanya
                      gempa vulkanik atau hembusan asap.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-orange-500/30 bg-orange-500/10 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-orange-400 shrink-0" />
                      <span className="font-semibold text-orange-200 text-xs">ORANYE (Orange)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <strong>Level III (Siaga):</strong> Erupsi sedang terjadi dengan kolom abu
                      terbatas, atau potensi letusan tinggi.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400 shrink-0" />
                      <span className="font-semibold text-red-200 text-xs">MERAH (Red)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <strong>Level IV (Awas):</strong> Erupsi eksplosif besar sedang berlangsung, abu
                      terlempar tinggi ke jalur pesawat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Simbol Layer Peta */}
              <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Lapisan &amp; Bentuk Gambar di Peta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-muted/20">
                    <div className="h-7 w-9 rounded border border-orange-400 bg-orange-400/20 shrink-0 flex items-center justify-center text-[10px] text-orange-300 font-mono">
                      {'///'}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Arsiran Oranye (Footprint Model)
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Wilayah yang diproyeksikan oleh model komputer berpeluang dilewati partikel
                        abu dalam rentang waktu simulasi.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-muted/20">
                    <div className="h-7 w-9 rounded border border-fuchsia-400 bg-fuchsia-400/20 shrink-0 flex items-center justify-center text-[10px] text-fuchsia-300 font-mono">
                      VAAC
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Garis Ungu/Magenta (Area VAAC)
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Area ruang udara yang diamati oleh VAAC Darwin. Merupakan acuan resmi pilot
                        dan maskapai untuk menghindari abu di langit.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-muted/20">
                    <div className="h-7 w-9 rounded border border-amber-300/80 border-dashed bg-transparent shrink-0 flex items-center justify-center text-[10px] text-amber-300 font-mono">
                      --&gt;
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Garis Kuning Putus-putus (Trayektori)
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Jalur gerak lintasan angin utama yang membawa partikel abu dari mulut kawah
                        menuju arah tertentu selama 12-24 jam ke depan.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-muted/20">
                    <div className="h-7 w-9 rounded border border-sky-400 bg-sky-400/20 shrink-0 flex items-center justify-center text-sky-300">
                      <Wind className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Panah Arah Angin (Grid Atmosfer)
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Menunjukkan arah tujuan hembusan angin. Warna panah menandai kecepatan: abu-abu
                        (lemah), kuning (sedang), oranye/merah (kencang).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: LANGKAH PENGGUNAAN */}
            <TabsContent value="fitur" className="m-0 space-y-4">
              <div className="rounded-lg border border-border bg-card/60 p-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Langkah Mudah Menggunakan Aplikasi:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      <span className="font-semibold text-xs">Pilih Kejadian Letusan</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Buka panel <strong>Daftar Kejadian</strong> di sebelah kiri (atau klik tombol{' '}
                      <em>Buka Panel</em> jika sedang tertutup). Klik salah satu gunung seperti{' '}
                      <strong>Semeru</strong>, <strong>Lewotobi</strong>, atau{' '}
                      <strong>Anak Krakatau</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      <span className="font-semibold text-xs">Amati Peta &amp; Lapisan</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Peta akan langsung memusatkan tampilan ke gunung tersebut. Gunakan kotak{' '}
                      <strong>Legenda di kanan</strong> untuk menyalakan/mematikan lapisan angin, model,
                      atau advisory pesawat sesuai keinginan Anda.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </span>
                      <span className="font-semibold text-xs">Buka Lembar Detail</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Klik tombol <strong>&ldquo;Detail&rdquo;</strong> untuk melihat dokumen VONA asli,
                      daftar kabupaten yang berpotensi dilintasi abu, serta grafik ketinggian angin
                      vertikal (*wind sounding*).
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-200">
                  <span className="font-semibold">💡 Tips Tampilan:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-[11px] text-sky-100/90">
                    <li>
                      <strong>Tutup/Buka Workspace:</strong> Klik tombol panah di sudut panel kejadian
                      agar peta terlihat luas tanpa terhalang.
                    </li>
                    <li>
                      <strong>Pindahkan Legenda:</strong> Klik tombol panah atas/bawah pada kotak Legenda
                      untuk memindahkannya ke sudut atas atau bawah peta.
                    </li>
                    <li>
                      <strong>Zoom Peta:</strong> Gunakan roda mouse atau cubit layar (*pinch to zoom*)
                      di ponsel untuk memperbesar wilayah sekitar kawah.
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: TINDAKAN KESELAMATAN */}
            <TabsContent value="keselamatan" className="m-0 space-y-4">
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-400" /> Protokol Kesehatan &amp; Keselamatan Saat Terjadi Hujan Abu
                </h4>
                <p className="text-xs text-red-100/90 leading-relaxed">
                  Abu vulkanik terdiri dari pecahan batuan runcing mikro dan silika kristal yang sangat
                  kasar dan berbahaya bagi saluran pernapasan, mata, serta mesin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    😷 1. Lindungi Saluran Pernapasan
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Gunakan masker standar N95 atau masker medis bedah rangkap jika berada di luar
                    ruangan. Basahi masker kain dengan sedikit air jika masker medis tidak tersedia.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    👓 2. Lindungi Penglihatan
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Gunakan kacamata pelindung (*goggles*) atau kacamata biasa. <strong>JANGAN</strong>{' '}
                    gunakan lensa kontak (*contact lens*) saat terjadi hujan abu karena dapat melukai
                    kornea mata.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    💧 3. Tutup Sumber Air &amp; Makanan
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tutup rapat tandon air, sumur, wadah makan, dan pakan ternak agar tidak tercemar
                    sulfur dan abu yang asam.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card/60 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    🏠 4. Tetap Berada Di Dalam Ruangan
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tutup semua pintu, jendela, dan ventilasi. Hindari berkendara karena jalanan licin
                    dan abu dapat merusak filter mesin kendaraan.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: KAMUS ISTILAH AWAM */}
            <TabsContent value="istilah" className="m-0 space-y-4">
              <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Glosarium / Kamus Istilah Sederhana:
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2 rounded border border-border bg-muted/20">
                    <strong className="text-primary font-mono">VONA (Volcano Observatory Notice for Aviation)</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pemberitahuan resmi yang diterbitkan oleh Pos Pengamatan PVMBG saat gunung meletus
                      khusus untuk keselamatan rute penerbangan pesawat.
                    </p>
                  </div>

                  <div className="p-2 rounded border border-border bg-muted/20">
                    <strong className="text-primary font-mono">VAAC (Volcanic Ash Advisory Centre)</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pusat pemantauan abu vulkanik internasional (untuk wilayah Indonesia dipantau
                      oleh VAAC Darwin, Biro Meteorologi Australia).
                    </p>
                  </div>

                  <div className="p-2 rounded border border-border bg-muted/20">
                    <strong className="text-primary font-mono">m ASL (Meter Above Sea Level)</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Ketinggian dihitung dari atas permukaan laut rata-rata. Contoh: Semeru puncaknya
                      3.676 m ASL.
                    </p>
                  </div>

                  <div className="p-2 rounded border border-border bg-muted/20">
                    <strong className="text-primary font-mono">FL / Flight Level (Contoh: FL140)</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Tingkat ketinggian terbang pesawat dalam satuan ratusan kaki. FL140 berarti
                      14.000 kaki (sekitar 4.267 meter).
                    </p>
                  </div>

                  <div className="p-2 rounded border border-border bg-muted/20">
                    <strong className="text-primary font-mono">hPa (Hektopaskal, Contoh: 850 hPa)</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Satuan tekanan udara di atmosfer. Tekanan di permukaan tanah sekitar 1000 hPa,
                      850 hPa berada di ketinggian sekitar 1.500 m, dan 500 hPa di sekitar 5.600 m.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Dialog */}
        <div className="px-5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Aplikasi Pemantauan Abu Vulkanik Indonesia &bull; Edisi Edukasi Publik
          </span>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Tutup Panduan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
