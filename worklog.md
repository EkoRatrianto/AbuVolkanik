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
