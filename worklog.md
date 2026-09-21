# Worklog — Aplikasi Pemantauan Abu Vulkanik Indonesia

Proyek: Membangun aplikasi web pemantauan abu vulkanik Indonesia berdasarkan dokumen rancangan
`Rancangan_Aplikasi_Monitoring_Abu_Vulkanik_Indonesia.md`.

Prinsip utama (dari dokumen):
- Platform fusi bukti, BUKAN prediksi mandiri.
- Semua output model wajib berlabel "INDIKASI MODEL".
- Status resmi, model, dan laporan belum terverifikasi TIDAK dicampur.
- "Berpotensi terlintasi" ≠ "terkonfirmasi terdampak".
- "Tidak ada data" ≠ "tidak terdampak".
- Setiap angka memiliki sumber + waktu berlaku + provenance.

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Membangun aplikasi web pemantauan abu vulkanik Indonesia berdasarkan dokumen rancangan lengkap.

Work Log:
- Membaca dokumen rancangan `Rancangan_Aplikasi_Monitoring_Abu_Vulkanik_Indonesia.md` (592 baris) secara lengkap.
- Menyusun skema Prisma (SQLite) untuk 9 model: SourceRegistry, Volcano, EruptionEvent, SourceDocument, AshObservation, ModelRun, AshFootprint, AdminUnit, AdminExposure, IngestLog.
- Membuat data geografis Indonesia (`src/lib/geo.ts`): outline 13 pulau utama (Sumatra, Jawa, Bali, Lombok, Sumbawa, Flores, Timor, Kalimantan, Sulawesi, Maluku Utara, Halmahera, Seram, Papua), proyeksi equirectangular, helper windToFrom/windToUV/compassName.
- Membuat seed data (`scripts/seed.ts`): 18 gunung api Indonesia (koordinat publik), 8 source registry (PVMBG, BMKG-CUACA, BMKG-CAP, VAAC-Darwin, NOAA-GFS, OPEN-METEO, NASA-GIBS, HYSPLIT), 7 admin unit, 3 event (Semeru 20 Sep 2026 sesuai dokumen + Anak Krakatau + Lewotobi), model run HYSPLIT unit-source, footprint polygon, trajectory line, ingest logs.
- Membuat 5 API routes: /api/volcanoes, /api/events, /api/events/[id], /api/source-health, /api/wind-profile.
- Membuat 9 komponen UI di src/components/volcanic/: types.ts, Header, DisclaimerBanner, MapView (SVG Indonesia interaktif), MapLegend, EventList, EventDetail (slide-over), WindProfile (vertikal multilapis), DataHealth (dashboard konektor), Footer (sticky).
- Set up tema dark "operational dashboard" (palet vulkanik/bumi: amber/oranye/batu, NO indigo/biru sebagai primer).
- Integrasikan ke page.tsx dengan layout responsive (sidebar + map), QueryClientProvider.
- Verifikasi dengan agent browser: peta terender, event Semeru klik → detail panel dengan timeline + wind profile + dua daftar terpisah (potensi model vs terkonfirmasi), data 4.076 m ASL + konflik satuan terdeteksi, panel kesehatan sumber, footer sticky di desktop & ter-push natural di mobile.

Stage Summary:
- Aplikasi MVP berfungsi penuh sesuai prinsip dokumen: platform fusi bukti, INDIKASI MODEL bukan peringatan resmi.
- Status "berpotensi terlintasi" dan "terkonfirmasi terdampak permukaan" DIPISAH secara visual dan data.
- Konflik satuan sumber (13.043 ft vs 4.076 m) ditampilkan, bukan dikoreksi diam-diam.
- Level angin bawah tanah disembunyikan (sesuai §9.2 aturan 5).
- Footer sticky di desktop (mt-auto + min-h-screen flex flex-col), ter-push natural di mobile.
- Lint lulus, tanpa console error. Dev server jalan di port 3000.
- Catatan: HYSPLIT model adalah simulasi data (bukan run aktual); endpoint eksternal (BMKG, Open-Meteo) tidak diakses langsung sesuai dokumen yang menyatakan belum lulus uji konektivitas.

---
Task ID: 2
Agent: main (Z.ai Code)
Task: Perbaiki script untuk: (1) gambar peta realistis OSM, (2) data VAAC sebaran abu per lapis atmosfer, (3) peta arah angin & cuaca.

Work Log:
- Install maplibre-gl@6.10.0 untuk peta vektor/raster interaktif.
- Update seed (scripts/seed.ts): tambah VAAC Darwin advisory source document + 3 polygon abu atmosfer multi-flight-level untuk Semeru:
  * FL050-FL100 (~3 km ASL, polygon sempit dekat sumber)
  * FL100-FL150 (~4.5 km ASL, polygon lebih luas mengikuti gerak timur laut)
  * FL150-FL200 (~6 km ASL, polygon paling luas terbawa angin tinggi)
- Update API /api/events/[id]: return `vaacPolygons` array terpisah per flight level (evidenceType ADV-AIRSPACE).
- Update API /api/events: function pickLatestObservation prioritaskan OBS-VOLCANO (notice resmi) di atas ADV-AIRSPACE, agar ringkasan daftar menampilkan kolom 4.076 m ASL (VONA) bukan 3.000 m (VAAC FL100).
- Buat API /api/wind-field?level=... — grid 22×12 arah angin & cuaca nasional, simulasi deterministik berbasis pola sirkulasi atmosfer Indonesia (trade wind easterlies, monsoon, jet stream, ITCZ). 6 pressure level: 1000/925/850/700/500/300 hPa.
- Buat komponen MapLibreView.tsx (ganti SVG MapView lama):
  * Base layer OpenStreetMap raster tiles (realistis dengan coastlines/pulau)
  * Marker gunung api custom HTML (warna aviation color, pulse untuk aktif)
  * Popup hover dengan info puncak/province/kejadian
  * Layer GeoJSON: footprint (orange hatched pattern via canvas), trajectory (dashed amber), VAAC polygons (magenta outline per FL, 3 warna gradasi), admin markers (circle dengan label), wind arrows (3 level warna), precip circles
  * ResizeObserver untuk handle container resize saat sheet buka/tutup
  * Cleanup markers/layers pada unmount
- Buat komponen WindWeatherMap.tsx (Sheet bottom 90vh):
  * Selector pressure level (6 tombol hPa)
  * Toggle Angin/Presipitasi
  * SVG grid Indonesia: panah arah gerak udara per cell, warna berbasis kecepatan (krem→oranye→merah), lingkaran presipitasi (biru/indigo untuk konveksi), garis khatulistiwa, marker Semeru
  * Legenda angin & cuaca, info level meta (hPa, m ASL, deskripsi)
- Update page.tsx: swap MapView→MapLibreView, tambah state showVaacLayer + weatherOpen, tombol "Angin & Cuaca" di sidebar, pass vaacPolygons ke selectedGeometry.
- Update MapLegend: tambah toggle VAAC advisory layer (cloud icon, magenta).
- Update EventDetail: tambah section "VAAC Advisory — Abu Atmosfer Multi-Lapis" dengan disclaimer "abu di ruang udara, BUKAN jatuhan permukaan" + per-FL breakdown.
- Tambah CSS: animasi vpulse untuk marker, styling dark popup MapLibre, override attribution control.
- Verifikasi dengan agent-browser:
  * Peta OSM realistis terender (VLM konfirmasi: Sumatra, Jawa, Bali, Kalimantan, Sulawesi terlihat)
  * Tile.openstreetmap.org 200 response (network check)
  * Klik Semeru → 13 layer ter-add (osm-base, footprint-fill/line, trajectory-line, vaac-fill/line-0/1/2, admin-circles/labels, wind-arrows)
  * VLM konfirmasi visual: magenta polygon VAAC, orange hatched footprint, dashed amber trajectory, colored wind arrows, orange volcano markers — semua terlihat di peta zoom Semeru
  * Panel Wind & Weather: grid panah angin, presipitasi circles, 6 level hPa selector (850→300 berubah), garis khatulistiwa, pola sirkulasi (trade wind/monsoon/jet)
  * Detail panel: FL100/FL150/FL200, "ruang udara", "unit-source" semua muncul
  * Footer sticky: desktop footerAtBottom=true (839+60=900 viewport), mobile ter-push natural (body 1070 > viewport 844)
  * Lint lulus, no console errors

Stage Summary:
- Peta realistis OpenStreetMap via MapLibre GL JS (sesuai rekomendasi dokumen §6.2).
- Data VAAC Darwin multi-flight-level (FL050-FL200) menggambarkan sebaran abu atmosfer per lapisan, sesuai arah angin pada level atmosfer tersebut.
- Peta arah angin & cuaca nasional dengan 6 pressure level, grid 22×12, pola sirkulasi realistis (trade wind/monsoon/jet stream/ITCZ).
- Semua peningkatan terverifikasi visual via VLM dan interaktif via agent-browser.

---
Task ID: 3
Agent: main (Z.ai Code)
Task: Perbaiki peta tidak terlihat untuk user.

Work Log:
- Diagnosa masalah via agent-browser: `.maplibregl-map` container collapse ke height 0 meski parent (section) punya tinggi 527px. `h-full` wrapper mengevaluasi ke 0 karena parent flex-derived height tidak "definite" untuk persentase CSS.
- Masalah kedua: tile OSM (a.tile.openstreetmap.org) tidak mengirim CORS header, mungkin diblokir di jaringan user. CartoDB dark_all menampilkan watermark "API KEY REQUIRED".
- Solusi 1 (container): hapus wrapper div `<div className="relative w-full h-full">`, ganti MapLibreView return jadi fragment dengan container langsung `className="absolute inset-0"` + inline style position:absolute/inset-0. Section (parent) sudah relative, jadi container absolute langsung mengisi section.
- Solusi 2 (CSS global): tambah `.maplibregl-map { position: absolute !important; top/left/right/bottom: 0; width/height: 100% !important; }` untuk paksa tinggi penuh.
- Solusi 3 (tile source): ganti OSM tiles → ESRI World Imagery (satelit realistis seperti Google Earth, free, CORS-enabled, no API key, no watermark) + CartoDB voyager_only_labels overlay untuk nama tempat.
- Solusi 4 (layout): section `min-h-[420px] lg:min-h-[500px]` (sebelumnya `lg:min-h-0` bisa collapse).
- Solusi 5 (resize): tambah `setTimeout(() => map.resize(), 100/500)` setelah load + ResizeObserver + `map.on('error')` logging.
- Tingkatkan visibility layer: footprint-line width 1.8→3 opacity 1, trajectory-line width 2.2→3.5 color `#fde047` (bright yellow) opacity 1.
- Verifikasi via agent-browser + VLM:
  * Desktop: mapH=722, canvasH=722, footerAtBottom=true (839+60=900 viewport)
  * Mobile 390x844: mapH=420, canvasH=420, footer ter-push natural (body 1070 > viewport 844)
  * VLM konfirmasi: satellite imagery (green/brown land, dark ocean, Indonesia islands), NO watermark, magenta VAAC polygons + orange footprint + yellow trajectory + blue wind arrows + volcano markers semua terlihat
  * Panel Wind & Weather: 6 level hPa, 275 wind arrows terender
  * Layer API confirmed: 14 layers (satellite-base, labels-overlay, footprint-fill/line, trajectory-line, vaac-fill/line-0/1/2, admin-circles/labels, wind-arrows)

Stage Summary:
- Peta tidak terlihat karena container collapse (height 0) + tile watermark. Kedua masalah teratasi.
- Peta sekarang pakai ESRI World Imagery (satelit realistis Google Earth style) + OSM labels overlay, tanpa watermark, CORS-enabled.
- Container absolute inset-0 langsung di section relative, dengan CSS force height 100%.
- Semua layer (VAAC, footprint, trajectory, wind, markers) terlihat di desktop & mobile.
- Footer sticky di desktop, ter-push natural di mobile. Lint lulus, no console errors.

---
Task ID: 4
Agent: main (Z.ai Code)
Task: Sederhanakan arah angin — ganti panel SVG terpisah dengan overlay panah sederhana di atas peta.

Work Log:
- Hapus komponen WindWeatherMap.tsx (panel Sheet bottom 90vh dengan SVG grid 22×12 kompleks).
- Tambah helper `makeArrowFeature(cell)` di MapLibreView: setiap cell jadi 1 Feature MultiLineString dengan 3 segmen (shaft A→B + 2 sisi kepala C→B, D→B). Arah gerak = windFrom+180. Warna berbasis kecepatan: <4 abu, <8 amber, <14 oranye, ≥14 merah.
- Tambah prop `showWindGrid` + `windFieldCells` ke MapLibreView. Layer `wind-grid-arrows` (line, data-driven color via `['get','color']`) dirender di atas peta tanpa perlu event terpilih.
- Update page.tsx: hapus import WindWeatherMap + tombol "Angin & Cuaca" di sidebar + state weatherOpen. Tambah state `showWindGrid` (default true) + `windGridLevel` (default 850). Fetch /api/wind-field?level=langsung (always-on, staleTime 5 menit). Pass cells ke MapLibreView + props ke MapLegend.
- Update MapLegend: tambah toggle "Panah arah angin (grid nasional)" dengan icon Navigation + preview arrow SVG. Saat ON, tampilkan selector 6 level compact (1000/925/850/700/500/300 hPa). Ganti label toggle angin lama jadi "Profil angin multilapis (event)" agar tidak overlap dengan grid.
- Verifikasi via agent-browser + VLM:
  * Layer `wind-grid-arrows` ter-add di load awal (sebelum klik event)
  * VLM konfirmasi: panah kecil tersebar di peta (terlihat di area laut), overlay di atas satelit
  * Selector level berfungsi: klik 500 → API call wind-field?level=500, label "Level: 500 hPa"
  * Toggle ON/OFF berfungsi: layer hilang saat OFF
  * Mobile 390x844: mapH=420, wind-grid-arrows ada, footer ter-push natural (body 1120 > viewport 844)
  * Lint lulus, no console errors

Stage Summary:
- Arah angin sekarang sederhana: hanya gambar panah overlay di atas peta satelit, dengan toggle + selector level di legend.
- Hapus panel WindWeatherMap kompleks (SVG grid 22×12 + 2 legend terpisah).
- Satu toggle di legend mengaktifkan grid panah nasional; 6 tombol level hPa untuk ganti pressure level.
- Panah = MultiLineString 3 segmen (shaft + kepala) per cell, warna berbasis kecepatan.
- Desktop & mobile terverifikasi via VLM.

---
Task ID: 5
Agent: main (Z.ai Code)
Task: Perbaiki PageUp/PageDown tidak bekerja di window detail.

Work Log:
- Diagnosa: komponen `ScrollArea` Radix UI memblokir keyboard scroll (PageUp/PageDown/Space/Home/End) karena:
  * Viewport Radix pakai `overflow: hidden` + custom scrollbar (bukan native scrollable)
  * Radix Dialog men-trap focus ke tombol Close, bukan ke scroll container
  * Browser keyboard scroll hanya bekerja pada native scrollable element yang punya focus
- Solusi: ganti `<ScrollArea>` Radix dengan `<div>` native `overflow-y-auto` + `tabIndex={0}` + `role="region"`, dan fokuskan container saat sheet terbuka.
- EventDetail.tsx:
  * Hapus import `ScrollArea`
  * Tambah `useRef<HTMLDivElement>` + `useEffect` untuk auto-focus scroll container (delay 120ms setelah open)
  * Ganti `<ScrollArea className="flex-1 scroll-volcanic">` → `<div ref={scrollRef} role="region" aria-label="Konten detail kejadian" tabIndex={0} className="scroll-volcanic flex-1 overflow-y-auto outline-none focus-visible:ring-1 focus-visible:ring-ring/40">`
  * Tutup `</ScrollArea>` → `</div>`
- DataHealth.tsx: sama — ganti ScrollArea → div native + ref + useEffect auto-focus.
- Verifikasi via agent-browser:
  * EventDetail: scrollHeight 3409 > clientHeight 486 (konten panjang). Setelah klik Semeru: activeElement = "Konten detail kejadian" (auto-focus bekerja, tabIndex=0).
  * PageDown: scrollTop 0 → 425 (satu layar)
  * PageUp: scrollTop 425 → 0
  * End: → 2923 (paling bawah)
  * Home: → 0 (paling atas)
  * ArrowDown ×3: → 120 (scroll halus per baris)
  * Space: → 545 (satu layar, sama seperti PageDown)
  * DataHealth: scrollHeight 2031 > 470. PageDown → 411, PageUp → 0.
  * Lint lulus, no console errors.

Stage Summary:
- PageUp/PageDown/Home/End/Space/Arrow keys sekarang semua bekerja di window detail (EventDetail) dan panel Kesehatan Sumber (DataHealth).
- Akar masalah: Radix ScrollArea + Dialog focus trap memblokir keyboard scroll native.
- Solusi: native div `overflow-y-auto` + `tabIndex={0}` + auto-focus saat sheet open.
- Native browser scroll otomatis mendukung semua keyboard shortcut tanpa handler tambahan.

---
Task ID: 6
Agent: main (Z.ai Code)
Task: Perbaiki grafik profil angin multilapis — arah angin tidak jelas kemana.

Work Log:
- Diagnosa masalah lama:
  * Panah terlalu kecil (arrowLen=14px) — sulit dilihat
  * Posisi panah = x berdasarkan kecepatan, sehingga tiap level panah di posisi x berbeda, membingungkan
  * Label hanya derajat numerik "→ 50°" tanpa nama kompas — user tidak tahu 50° itu arah mana
  * Tidak ada kompas rose acuan — user tidak tahu utara di mana
  * Marker kecepatan (titik di posisi x=speed) konflik dengan panah arah
- Redesign WindProfile.tsx dengan layout 4 kolom yang jelas:
  1. **Kolom TEKANAN** (hPa) — angka besar + label satuan
  2. **Kolom KETINGGIAN** — m ASL + m AGL
  3. **Kolom PANAH ARAH** — lingkaran kompas (r=32px) dengan panah BESAR (shaft + kepala) di tengah, tick U/T/S/B di tepi lingkaran, label arah kompas 16-arah di bawah
  4. **Kolom KECEPATAN** — bar horizontal dengan warna berbasis kecepatan + angka m/s
- Tambah helper `compass16(deg)` — singkatan 16 arah (U, U·TL, TL, TL·T, T, ...) untuk presisi
- Tambah helper `levelColor()` dan `speedColor()` untuk konsistensi warna
- Tambah kompas rose acuan di header (lingkaran dengan panah merah utara + label U/T/S/B) untuk orientasi
- Setiap baris level: zebra background untuk readability, garis pemisah
- Label arah ganda: nama lengkap (Utara/Timur Laut/dll) + singkatan 16-arah + derajat
- Penjelasan "Cara baca" eksplisit: "Panah = arah GERAK udara (menuju). Panah ke kanan = Timur."
- Tambah legenda kecepatan (lemah→sangat kuat) dengan warna bar
- Verifikasi via agent-browser + VLM:
  * VLM konfirmasi: panah besar & jelas di lingkaran kompas, label U/T/S/B terlihat, kompas rose acuan ada
  * VLM berhasil identifikasi semua 4 level dengan arah:
    - 600 hPa → Timur Laut (~45°), panah hijau
    - 500 hPa → Timur Laut (~41°), panah hijau
    - 400 hPa → Timur (~91°), panah ungu
    - 300 hPa → Timur (~75°), panah ungu
  * Arah konsisten dengan data VONA Semeru ("gerak: northeast/timur laut")
  * Lint lulus, no console errors

Stage Summary:
- Profil angin multilapis sekarang jauh lebih jelas: panah besar di tengah lingkaran kompas per level, label arah lengkap (Utara/Timur Laut/dll + singkatan + derajat), kompas rose acuan, kecepatan dengan bar warna.
- User dapat langsung melihat arah angin kemana di setiap level atmosfer.

---
Task ID: 7
Agent: main (Z.ai Code)
Task: Bersihkan script dari semua issue (lint + TypeScript).

Work Log:
- Jalankan `bun run lint` → lulus (0 error).
- Jalankan `bunx tsc --noEmit` → 12 TypeScript error ditemukan:
  * 2 di `examples/websocket/` (socket.io-client tidak terinstall) — bawaan template
  * 1 di `skills/image-edit/` — bawaan skill
  * 1 di `skills/stock-analysis-skill/` — bawaan skill
  * 8 di `src/` — kode aplikasi yang perlu diperbaiki
- Perbaiki issue di src/:
  1. **Hapus `src/components/volcanic/MapView.tsx`** — file lama tidak terpakai (diganti MapLibreView). Menghilangkan 2 error `precipMm` + reference usang.
  2. **`src/app/api/wind-field/route.ts`** — `const cells = []` menginfer `never[]`. Fix: tambahkan type annotation eksplisit `Array<{lng,lat,windFromDeg,speedMs,precipMm,cloudCover,isConvective}>`.
  3. **`src/components/volcanic/MapLibreView.tsx`** — 3 type issues:
     - Tambah `province: string` ke type `volcanoes` (dipakai di popup HTML)
     - Tambah `precipMm: number` ke type `windLevels` di selectedGeometry (dipakai di precip layer)
     - Ganti `marker.setPopup(popup).addPopup(popup)` + `marker.removePopup()` (method tidak ada di API MapLibre Marker) → pakai standalone Popup: `popup.setLngLat([lng,lat]).addTo(map)` untuk show, `popup.remove()` untuk hide. Lebih reliable untuk hover custom marker.
  4. **`tsconfig.json`** — exclude `examples`, `skills`, `tests`, `download` dari type-check (folder bawaan template/skill, bukan kode aplikasi). Hanya cek `src/` + `prisma/`.
- Verifikasi:
  * `bun run lint` → lulus (0 error)
  * `bunx tsc --noEmit` → EXIT 0 (0 error)
  * agent-browser: page load tanpa runtime error, 15 map layers ter-add (termasuk wind-grid-arrows), detail panel Semeru terbuka dengan wind SVG + VAAC section + FL100.

Stage Summary:
- Script sekarang bersih dari issue: ESLint 0 error, TypeScript 0 error.
- Hapus file usang (MapView.tsx), perbaiki 5 type error, exclude folder bawaan template dari tsc.
- Runtime terverifikasi: semua fitur (peta, wind grid, VAAC, wind profile, detail panel) bekerja tanpa error.
