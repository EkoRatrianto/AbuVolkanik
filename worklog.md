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
