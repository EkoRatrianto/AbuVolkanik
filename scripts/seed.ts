// Seed data untuk Aplikasi Pemantauan Abu Vulkanik Indonesia.
// Data gunung api menggunakan koordinat & elevasi publik umum.
// Event Semeru 20 Sep 2026 22:25 UTC diambil dari dokumen rancangan
// (VONA MAGMA, ash top ~4.076 m ASL, bergerak timur laut, ground observer).
//
// STATUS: data indikatif untuk demonstrasi MVP. BUKAN sistem operasional
// atau peringatan resmi. Lihat disclaimer di footer aplikasi.

import { db } from '../src/lib/db'

// ---------- Gunung api Indonesia (data publik umum) ----------
const VOLCANOES = [
  { code: 'SEM', officialName: 'Semeru', lat: -8.108, lng: 112.922, summitMAsl: 3676, province: 'Jawa Timur', region: 'Jawa', aviationColor: 'ORANGE', krStatus: 'Level III' },
  { code: 'KRAK', officialName: 'Anak Krakatau', lat: -6.102, lng: 105.423, summitMAsl: 157, province: 'Lampung', region: 'Sunda', aviationColor: 'YELLOW', krStatus: 'Level III' },
  { code: 'MER', officialName: 'Merapi', lat: -7.541, lng: 110.446, summitMAsl: 2910, province: 'DI Yogyakarta', region: 'Jawa', aviationColor: 'ORANGE', krStatus: 'Level III' },
  { code: 'SIN', officialName: 'Sinabung', lat: 3.17, lng: 98.392, summitMAsl: 2460, province: 'Sumatera Utara', region: 'Sumatra', aviationColor: 'YELLOW', krStatus: 'Level II' },
  { code: 'AGUNG', officialName: 'Agung', lat: -8.343, lng: 115.508, summitMAsl: 3142, province: 'Bali', region: 'Sunda Kecil', aviationColor: 'YELLOW', krStatus: 'Level II' },
  { code: 'RIN', officialName: 'Rinjani', lat: -8.412, lng: 116.458, summitMAsl: 3726, province: 'Nusa Tenggara Barat', region: 'Sunda Kecil', aviationColor: 'YELLOW', krStatus: 'Level II' },
  { code: 'BRO', officialName: 'Bromo', lat: -7.942, lng: 112.953, summitMAsl: 2329, province: 'Jawa Timur', region: 'Jawa', aviationColor: 'YELLOW', krStatus: 'Level II' },
  { code: 'KEL', officialName: 'Kelud', lat: -7.933, lng: 112.308, summitMAsl: 1731, province: 'Jawa Timur', region: 'Jawa', aviationColor: 'GREEN', krStatus: 'Level I' },
  { code: 'DUK', officialName: 'Dukono', lat: 1.686, lng: 127.89, summitMAsl: 1335, province: 'Maluku Utara', region: 'Maluku', aviationColor: 'ORANGE', krStatus: 'Level II' },
  { code: 'IBU', officialName: 'Ibu', lat: 1.483, lng: 127.63, summitMAsl: 1340, province: 'Maluku Utara', region: 'Maluku', aviationColor: 'ORANGE', krStatus: 'Level II' },
  { code: 'LEW', officialName: 'Lewotobi', lat: -8.536, lng: 122.775, summitMAsl: 1703, province: 'Nusa Tenggara Timur', region: 'Sunda Kecil', aviationColor: 'ORANGE', krStatus: 'Level III' },
  { code: 'ILL', officialName: 'Ili Lewotolok', lat: -8.275, lng: 123.474, summitMAsl: 1423, province: 'Nusa Tenggara Timur', region: 'Sunda Kecil', aviationColor: 'YELLOW', krStatus: 'Level II' },
  { code: 'MAR', officialName: 'Marapi', lat: -0.381, lng: 100.474, summitMAsl: 2891, province: 'Sumatera Barat', region: 'Sumatra', aviationColor: 'YELLOW', krStatus: 'Level II' },
  { code: 'KER', officialName: 'Kerinci', lat: -1.697, lng: 101.264, summitMAsl: 3800, province: 'Jambi', region: 'Sumatra', aviationColor: 'GREEN', krStatus: 'Level I' },
  { code: 'SLM', officialName: 'Slamet', lat: -7.243, lng: 109.208, summitMAsl: 3432, province: 'Jawa Tengah', region: 'Jawa', aviationColor: 'GREEN', krStatus: 'Level I' },
  { code: 'SMB', officialName: 'Sumbing', lat: -7.378, lng: 110.073, summitMAsl: 3371, province: 'Jawa Tengah', region: 'Jawa', aviationColor: 'GREEN', krStatus: 'Level I' },
  { code: 'TAL', officialName: 'Tambora', lat: -8.25, lng: 118.0, summitMAsl: 2850, province: 'Nusa Tenggara Barat', region: 'Sunda Kecil', aviationColor: 'GREEN', krStatus: 'Level I' },
  { code: 'SUK', officialName: 'Sangeang Api', lat: -8.2, lng: 119.075, summitMAsl: 1949, province: 'Nusa Tenggara Barat', region: 'Sunda Kecil', aviationColor: 'GREEN', krStatus: 'Level I' },
]

// ---------- Source registry ----------
const SOURCES = [
  {
    sourceId: 'PVMBG-VONA',
    owner: 'PVMBG / Badan Geologi',
    docsUrl: 'https://magma.esdm.go.id/vona',
    endpoint: 'https://magma.esdm.go.id/vona',
    format: 'HTML',
    license: 'Atribusi PVMBG; hak redistribusi otomatis belum diverifikasi',
    rateLimit: 'Tidak ada API publik terdokumentasi',
    expectedCadence: 'Saat ada notice/perubahan',
    legalStatus: 'pending',
    connectivityStatus: 'unverified',
    attribution: 'PVMBG MAGMA Indonesia',
    purpose: 'Kejadian, tinggi/arah kolom abu, kode warna penerbangan',
    notes: 'API publik tidak ditemukan. MVP: input manual dua-petugas / langganan email resmi.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-21T00:00:00Z'),
  },
  {
    sourceId: 'BMKG-CUACA',
    owner: 'BMKG',
    docsUrl: 'https://data.bmkg.go.id/prakiraan-cuaca/',
    endpoint: 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode}',
    format: 'JSON',
    license: 'Atribusi BMKG wajib',
    rateLimit: '60 permintaan/menit/IP',
    expectedCadence: '2× per hari; 3 hari ke depan, 8 titik/hari',
    legalStatus: 'approved',
    connectivityStatus: 'stale',
    attribution: 'BMKG Prakiraan Cuaca',
    purpose: 'Prakiraan cuaca permukaan wilayah aktif',
    notes: 'Endpoint belum lulus uji konektivitas dari lingkungan ini. Cache terpusat, hanya wilayah aktif.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-20T12:00:00Z'),
  },
  {
    sourceId: 'BMKG-CAP',
    owner: 'BMKG',
    docsUrl: 'https://data.bmkg.go.id/peringatan-dini-cuaca/',
    endpoint: 'https://www.bmkg.go.id/alerts/nowcast/id',
    format: 'CAP/XML',
    license: 'Atribusi BMKG wajib',
    rateLimit: '60 permintaan/menit/IP',
    expectedCadence: 'Poll 60–120 detik',
    legalStatus: 'approved',
    connectivityStatus: 'ok',
    attribution: 'BMKG Peringatan Dini Cuaca',
    purpose: 'Peringatan dini cuaca ke nasional–kecamatan',
    notes: 'Feed sah tanpa alert tetap sehat. Poll hemat dengan conditional request.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-21T03:58:00Z'),
  },
  {
    sourceId: 'VAAC-DARWIN',
    owner: 'Bureau of Meteorology Australia',
    docsUrl: 'https://www.bom.gov.au/aviation/volcanic-ash/',
    endpoint: 'https://www.bom.gov.au/aviation/volcanic-ash/darwin-va-advisory.shtml',
    format: 'HTML',
    license: 'Produk industri penerbangan; redistribusi mesin perlu konfirmasi',
    rateLimit: 'Tidak ada API publik terverifikasi',
    expectedCadence: 'Berbasis kejadian',
    legalStatus: 'pending',
    connectivityStatus: 'ok',
    attribution: 'Darwin VAAC, Bureau of Meteorology Australia',
    purpose: 'Advisory/poligon abu penerbangan resmi',
    notes: 'Saat verifikasi: nihil advisory Darwin 24 jam terakhir. Halaman nihil advisory bukan bukti nihil letusan.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-21T03:50:00Z'),
  },
  {
    sourceId: 'NOAA-GFS',
    owner: 'NOAA / NCEP',
    docsUrl: 'https://nomads.ncep.noaa.gov/',
    endpoint: 'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl',
    format: 'GRIB2',
    license: 'Ketentuan NOAA',
    rateLimit: 'Tidak dipublikasikan; siklus 00/06/12/18Z',
    expectedCadence: 'Siklus 6 jam; 0,25°',
    legalStatus: 'approved',
    connectivityStatus: 'stale',
    attribution: 'NOAA/NCEP NOMADS GFS',
    purpose: 'Medan meteorologi 3-D untuk pemodelan dispersi',
    notes: 'Unduhan GRIB belum diuji di lingkungan ini. Subset bbox/variabel, simpan cycle ID.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-20T18:00:00Z'),
  },
  {
    sourceId: 'OPEN-METEO',
    owner: 'Open-Meteo',
    docsUrl: 'https://open-meteo.com/en/docs',
    endpoint: 'https://api.open-meteo.com/v1/forecast',
    format: 'JSON',
    license: 'CC BY 4.0; nonkomersial <10.000/hari',
    rateLimit: '600/menit; 5.000/jam; 10.000/hari',
    expectedCadence: 'On demand; cache minimal 10–15 menit',
    legalStatus: 'approved',
    connectivityStatus: 'stale',
    attribution: 'Open-Meteo Forecast API',
    purpose: 'Angin pressure-level cepat untuk prototipe (BUKAN produksi otoritatif)',
    notes: 'Hanya prototipe/backup. Produksi harus pakai paket berbayar atau NOAA langsung.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-20T18:30:00Z'),
  },
  {
    sourceId: 'NASA-GIBS',
    owner: 'NASA Earthdata',
    docsUrl: 'https://www.earthdata.nasa.gov/data/tools/worldview',
    endpoint: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best',
    format: 'WMTS/Tiles',
    license: 'NASA Earthdata terms',
    rateLimit: 'On demand; cache sesuai terms',
    expectedCadence: 'Citra geostasioner 10-menit (90 hari)',
    legalStatus: 'approved',
    connectivityStatus: 'ok',
    attribution: 'NASA Worldview/GIBS',
    purpose: 'Konteks visual citra satelit; BUKAN deteksi abu tervalidasi',
    notes: 'Pilih produk ash-specific + QA flag + validasi lokal sebelum menyebut deteksi abu.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-21T03:55:00Z'),
  },
  {
    sourceId: 'HYSPLIT',
    owner: 'NOAA ARL',
    docsUrl: 'https://www.arl.noaa.gov/hysplit/volcanic-ash-model/',
    endpoint: 'self-hosted',
    format: 'Model output',
    license: 'Registrasi/ketentuan distribusi perangkat lunak',
    rateLimit: 'N/A (self-hosted)',
    expectedCadence: 'On event',
    legalStatus: 'approved',
    connectivityStatus: 'ok',
    attribution: 'NOAA ARL HYSPLIT',
    purpose: 'Simulasi dispersi/deposisi abu (unit-source untuk demo)',
    notes: 'Mode volcanic-ash default: sumber satuan 1 g, densitas 2.500 kg/m³, diameter 0,3–30 μm.',
    lastVerifiedAt: new Date('2026-09-21T00:00:00Z'),
    lastFetchedAt: new Date('2026-09-21T03:00:00Z'),
  },
]

// ---------- Admin units di sekitar Semeru ----------
const ADMIN_UNITS = [
  { code: 'LUM', name: 'Kab. Lumajang', province: 'Jawa Timur', lat: -8.13, lng: 113.0, level: 'adm2' },
  { code: 'MLG', name: 'Kab. Malang', province: 'Jawa Timur', lat: -8.0, lng: 112.5, level: 'adm2' },
  { code: 'PROB', name: 'Kab. Probolinggo', province: 'Jawa Timur', lat: -7.75, lng: 113.2, level: 'adm2' },
  { code: 'JMB', name: 'Kab. Jember', province: 'Jawa Timur', lat: -8.2, lng: 113.7, level: 'adm2' },
  { code: 'BOND', name: 'Kab. Bondowoso', province: 'Jawa Timur', lat: -7.9, lng: 113.8, level: 'adm2' },
  { code: 'SIT', name: 'Kab. Situbondo', province: 'Jawa Timur', lat: -7.7, lng: 114.0, level: 'adm2' },
  { code: 'PAS', name: 'Kab. Pasuruan', province: 'Jawa Timur', lat: -7.65, lng: 112.9, level: 'adm2' },
]

// Profil angin multilapis untuk Semeru (simulasi pressure level, BUKAN data observasi aktual)
// Arah FROM meteorologis
const WIND_LEVELS = [
  { pressureHpa: 1000, zMAsl: 110, windFromDeg: 200, speedMs: 3.2, precipMm: 0.1 },
  { pressureHpa: 925, zMAsl: 760, windFromDeg: 210, speedMs: 4.5, precipMm: 0.0 },
  { pressureHpa: 850, zMAsl: 1450, windFromDeg: 220, speedMs: 6.8, precipMm: 0.2 },
  { pressureHpa: 700, zMAsl: 3010, windFromDeg: 230, speedMs: 9.1, precipMm: 0.0 },
  { pressureHpa: 600, zMAsl: 4200, windFromDeg: 240, speedMs: 11.5, precipMm: 0.0 },
  { pressureHpa: 500, zMAsl: 5600, windFromDeg: 250, speedMs: 14.2, precipMm: 0.0 },
  { pressureHpa: 400, zMAsl: 7200, windFromDeg: 255, speedMs: 17.0, precipMm: 0.0 },
  { pressureHpa: 300, zMAsl: 9200, windFromDeg: 260, speedMs: 19.5, precipMm: 0.0 },
]

async function main() {
  console.log('🌱 Memulai seed...')

  await db.adminExposure.deleteMany()
  await db.ashFootprint.deleteMany()
  await db.modelRun.deleteMany()
  await db.ashObservation.deleteMany()
  await db.sourceDocument.deleteMany()
  await db.eruptionEvent.deleteMany()
  await db.adminUnit.deleteMany()
  await db.volcano.deleteMany()
  await db.ingestLog.deleteMany()
  await db.sourceRegistry.deleteMany()

  // 1. Source registry
  console.log('  • Source registry...')
  for (const s of SOURCES) {
    await db.sourceRegistry.create({ data: s })
  }

  // 2. Gunung api
  console.log('  • Gunung api...')
  const volcanoMap = new Map<string, string>()
  for (const v of VOLCANOES) {
    const created = await db.volcano.create({ data: v })
    volcanoMap.set(v.code, created.id)
  }

  // 3. Admin units
  console.log('  • Admin units...')
  for (const a of ADMIN_UNITS) {
    await db.adminUnit.create({
      data: { ...a, boundaryVersion: 'BIG-2024-v1' },
    })
  }

  // 4. Event Semeru 20 Sep 2026 22:25 UTC (dari dokumen rancangan)
  console.log('  • Event Semeru 20 Sep 2026...')
  const semeruId = volcanoMap.get('SEM')!
  const onsetAt = new Date('2026-09-20T22:25:00Z')
  const event = await db.eruptionEvent.create({
    data: {
      volcanoId: semeruId,
      onsetAt,
      status: 'officially_monitored',
      aviationColor: 'ORANGE',
      summary:
        'VONA PVMBG: awan abu dilaporkan mencapai ~4.076 m ASL (400 m di atas puncak), bergerak timur laut, berdasarkan pengamatan darat. Belum ada konfirmasi jatuhan abu permukaan.',
    },
  })

  await db.sourceDocument.create({
    data: {
      eventId: event.id,
      type: 'VONA',
      evidenceType: 'OBS-VOLCANO',
      externalId: 'd58d4209-0b19-4954-b74c-d98429784a0b',
      issuedAt: onsetAt,
      validFrom: onsetAt,
      url: 'https://magma.esdm.go.id/vona/d58d4209-0b19-4954-b74c-d98429784a0b',
      revision: 1,
      rawSummary:
        'VONA Semeru 20 Sep 2026 22:25 UTC. Awan abu setinggi 400 m di atas puncak (~4.076 m ASL), bergerak timur laut, berdasarkan pengamat darat. Kode warna penerbangan dinaikkan ke ORANGE. Catatan: ada inkonsistensi satuan di dokumen sumber (13.043 ft ≈ 3.976 m vs 3.676+400=4.076 m).',
    },
  })

  await db.ashObservation.create({
    data: {
      eventId: event.id,
      evidenceType: 'OBS-VOLCANO',
      ashTopMAsl: 4076,
      ashTopOriginal: '13043 ft / 4076 m',
      ashTopUnit: 'm',
      ashAboveSummitM: 400,
      movementToDeg: 45,
      movementFromDeg: 225,
      movementText: 'northeast (timur laut)',
      method: 'ground observer',
      confidence: 'medium',
      observedAt: onsetAt,
      conflict:
        'Inkonsistensi satuan sumber: 13.043 ft ≈ 3.976 m secara aritmatika, namun dokumen juga menyebut 3.676 m + 400 m = 4.076 m ASL. Sistem menyimpan nilai asli + menandai konflik; tidak mengoreksi sumber secara diam-diam.',
    },
  })

  // Profil angin multilapis disimpan sebagai footprint trajectory
  const metCycleAt = new Date('2026-09-20T18:00:00Z')
  const modelRun = await db.modelRun.create({
    data: {
      eventId: event.id,
      modelVersion: 'HYSPLIT-v5.2-unit-source',
      configHash: 'hysplit-semeru-20260920-2225z-unit1g-7a3f',
      metProvider: 'GFS 0.25° (cycle 2026-09-20 18Z)',
      metCycleAt,
      startedAt: new Date('2026-09-20T22:30:00Z'),
      finishedAt: new Date('2026-09-20T23:05:00Z'),
      status: 'passed',
      isUnitSource: true,
      assumptions: JSON.stringify({
        sourceTerm: 'unit-source 1 g (HYSPLIT volcanic-ash default)',
        massEmissionRate: 'unknown — unit source only',
        duration: '30 menit (asumsi sensitivitas, BUKAN durasi faktual)',
        columnTopMAsl: 4076,
        columnBottomMAsl: 3676,
        particleDiameterUm: '0.3–30',
        particleDensityKgM3: 2500,
        injectionProfile: 'seragam puncak–top kolom',
        ensembleMembers: 7,
        scenarios: ['short-10min', 'nominal-30min', 'long-60min'],
        wetDeposition: 'aktif (parameter scavenging default)',
        dryDeposition: 'aktif',
        windLevels: WIND_LEVELS,
        note: 'Tanpa source term massa tervalidasi → hanya footprint RELATIF/probabilistik. Tidak ada konsentrasi/ketebalan endapan.',
      }),
    },
  })

  // Footprint polygon ellipse di timur laut Semeru
  const centerLng = 113.5
  const centerLat = -7.8
  const footprintPolygon = makeEllipse(centerLng, centerLat, 1.8, 0.9, 32)
  const footprint = await db.ashFootprint.create({
    data: {
      modelRunId: modelRun.id,
      validFrom: new Date('2026-09-20T23:00:00Z'),
      validTo: new Date('2026-09-21T03:00:00Z'),
      verticalBand: 'SFC–FL150',
      polygonGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [footprintPolygon],
      }),
      metric: 'fraction_of_scenarios',
      value: 0.57,
      nMembers: 7,
      nIntersect: 4,
    },
  })

  // Trajectory screening line (garis putus-putus)
  const trajectoryLine: [number, number][] = [
    [112.922, -8.108],
    [113.1, -7.95],
    [113.3, -7.8],
    [113.5, -7.7],
    [113.8, -7.55],
    [114.1, -7.4],
  ]
  await db.ashFootprint.create({
    data: {
      modelRunId: modelRun.id,
      validFrom: new Date('2026-09-20T22:30:00Z'),
      validTo: new Date('2026-09-21T02:30:00Z'),
      verticalBand: 'trajectory-screening-FL100',
      polygonGeoJson: JSON.stringify({
        type: 'LineString',
        coordinates: trajectoryLine,
      }),
      metric: 'trajectory_screening',
      value: 0,
      nMembers: 1,
      nIntersect: 0,
    },
  })

  // Admin exposure (potensi terlintasi — BUKAN konfirmasi)
  const lumajang = await db.adminUnit.findUnique({ where: { code: 'LUM' } })
  const malang = await db.adminUnit.findUnique({ where: { code: 'MLG' } })
  const probolinggo = await db.adminUnit.findUnique({ where: { code: 'PROB' } })
  if (footprint && lumajang) {
    await db.adminExposure.create({
      data: {
        footprintId: footprint.id,
        adminId: lumajang.id,
        overlapAreaKm2: 412.5,
        ratio: 0.34,
        populationProxy: 185000,
        isConfirmed: false,
      },
    })
  }
  if (footprint && malang) {
    await db.adminExposure.create({
      data: {
        footprintId: footprint.id,
        adminId: malang.id,
        overlapAreaKm2: 256.8,
        ratio: 0.12,
        populationProxy: 98000,
        isConfirmed: false,
      },
    })
  }
  if (footprint && probolinggo) {
    await db.adminExposure.create({
      data: {
        footprintId: footprint.id,
        adminId: probolinggo.id,
        overlapAreaKm2: 88.2,
        ratio: 0.05,
        populationProxy: 31000,
        isConfirmed: false,
      },
    })
  }

  // 5. Event kedua: Anak Krakatau (awal Sep 2026, dari dokumen §13.3)
  console.log('  • Event Anak Krakatau (awal Sep 2026)...')
  const krakId = volcanoMap.get('KRAK')!
  const krakOnset = new Date('2026-09-08T14:20:00Z')
  const krakEvent = await db.eruptionEvent.create({
    data: {
      volcanoId: krakId,
      onsetAt: krakOnset,
      status: 'officially_monitored',
      aviationColor: 'YELLOW',
      summary:
        'Aktivitas Anak Krakatau; konteks citra NASA Worldview menautkan artikel ash dan SO₂. Latih pemisahan ash vs SO₂ — artikel visual BUKAN ground truth tunggal.',
    },
  })
  await db.sourceDocument.create({
    data: {
      eventId: krakEvent.id,
      type: 'OBS_SAT',
      evidenceType: 'OBS-SAT',
      issuedAt: krakOnset,
      validFrom: krakOnset,
      url: 'https://www.earthdata.nasa.gov/data/tools/worldview',
      rawSummary:
        'Citra NASA Worldview menampilkan sinyal ash + SO₂ di sekitar Anak Krakatau. Produk visual, BUKAN deteksi abu tervalidasi tanpa algoritme ash-specific + QA + review ahli.',
    },
  })
  await db.ashObservation.create({
    data: {
      eventId: krakEvent.id,
      evidenceType: 'OBS-SAT',
      ashTopMAsl: 1200,
      ashTopOriginal: 'estimasi satelit',
      method: 'satellite retrieval (unvalidated)',
      confidence: 'low',
      observedAt: krakOnset,
      conflict:
        'SO₂, aerosol index, asap kebakaran, debu, dan abu adalah variabel berbeda; tidak boleh dipetakan satu-ke-satu tanpa algoritme + validasi.',
    },
  })

  // 6. Event ketiga: Lewotobi (aktif, level III)
  console.log('  • Event Lewotobi...')
  const lewId = volcanoMap.get('LEW')!
  const lewOnset = new Date('2026-09-19T03:15:00Z')
  const lewEvent = await db.eruptionEvent.create({
    data: {
      volcanoId: lewId,
      onsetAt: lewOnset,
      status: 'officially_monitored',
      aviationColor: 'ORANGE',
      summary:
        'Letusan eksplosif Lewotobi. Tinggi kolom ~3.000 m ASL. Belum ada konfirmasi jatuhan abu permukaan resmi.',
    },
  })
  await db.sourceDocument.create({
    data: {
      eventId: lewEvent.id,
      type: 'VONA',
      evidenceType: 'OBS-VOLCANO',
      issuedAt: lewOnset,
      validFrom: lewOnset,
      url: 'https://magma.esdm.go.id/vona',
      rawSummary: 'VONA Lewotobi 19 Sep 2026 03:15 UTC. Kolom abu ~3.000 m ASL, bergerak barat.',
    },
  })
  await db.ashObservation.create({
    data: {
      eventId: lewEvent.id,
      evidenceType: 'OBS-VOLCANO',
      ashTopMAsl: 3000,
      ashAboveSummitM: 1297,
      movementToDeg: 270,
      movementFromDeg: 90,
      movementText: 'west (barat)',
      method: 'ground observer',
      confidence: 'medium',
      observedAt: lewOnset,
    },
  })

  // 7. Ingest logs (untuk data health dashboard)
  console.log('  • Ingest logs...')
  await db.ingestLog.create({ data: { sourceId: 'BMKG-CAP', runId: 'run-bmkg-cap-001', connector: 'bmkg-cap-poll', httpStatus: 200, latencyMs: 412, counts: 0, errorClass: null } })
  await db.ingestLog.create({ data: { sourceId: 'BMKG-CUACA', runId: 'run-bmkg-cuaca-001', connector: 'bmkg-cuaca-fetch', httpStatus: 429, latencyMs: 2100, counts: 0, errorClass: 'rate_limit', retryAt: new Date(Date.now() + 60000) } })
  await db.ingestLog.create({ data: { sourceId: 'NOAA-GFS', runId: 'run-gfs-001', connector: 'noaa-gfs-grib', httpStatus: 200, latencyMs: 8450, counts: 1, errorClass: null } })
  await db.ingestLog.create({ data: { sourceId: 'OPEN-METEO', runId: 'run-openmeteo-001', connector: 'openmeteo-wind', httpStatus: 200, latencyMs: 680, counts: 1, errorClass: null } })
  await db.ingestLog.create({ data: { sourceId: 'VAAC-DARWIN', runId: 'run-vaac-001', connector: 'vaac-darwin-check', httpStatus: 200, latencyMs: 950, counts: 0, errorClass: null } })
  await db.ingestLog.create({ data: { sourceId: 'NASA-GIBS', runId: 'run-gibs-001', connector: 'nasa-gibs-tiles', httpStatus: 200, latencyMs: 320, counts: 1, errorClass: null } })
  await db.ingestLog.create({ data: { sourceId: 'PVMBG-VONA', runId: 'run-pvmbg-manual-001', connector: 'pvmbg-manual-input', httpStatus: null, latencyMs: null, counts: 1, errorClass: null } })
  await db.ingestLog.create({ data: { sourceId: 'HYSPLIT', runId: 'run-hysplit-semeru-001', connector: 'hysplit-worker', httpStatus: null, latencyMs: null, counts: 1, errorClass: null } })

  console.log('✅ Seed selesai.')
}

function makeEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  steps: number
): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI
    pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)])
  }
  return pts
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
