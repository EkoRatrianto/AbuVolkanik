// Data geografis Indonesia yang disederhanakan untuk visualisasi SVG.
// Catatan: outline ini disederhanakan untuk tujuan demonstrasi, BUKAN peta navigasi resmi.
// Sumber acuan umum: batas geografis publik Indonesia.
// Status: data indikatif untuk prototipe.

// Bounding box Indonesia (untuk proyeksi)
export const INDONESIA_BBOX = {
  minLng: 94.5,
  maxLng: 141.5,
  minLat: -11.5,
  maxLat: 6.5,
}

// Proyeksi equirectangular sederhana ke koordinat SVG
export function project(
  lng: number,
  lat: number,
  width: number,
  height: number
): { x: number; y: number } {
  const x =
    ((lng - INDONESIA_BBOX.minLng) / (INDONESIA_BBOX.maxLng - INDONESIA_BBOX.minLng)) *
    width
  const y =
    ((INDONESIA_BBOX.maxLat - lat) / (INDONESIA_BBOX.maxLat - INDONESIA_BBOX.minLat)) *
    height
  return { x, y }
}

// Konversi derajat ke radian
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Arah gerak udara: wind_from + 180 mod 360 = wind_to
export function windToFrom(windFromDeg: number): number {
  return (windFromDeg + 180) % 360
}

// Komponen u/v dari arah & kecepatan angin
// u positif ke timur, v positif ke utara
export function windToUV(windFromDeg: number, speedMs: number) {
  const rad = toRad(windFromDeg)
  const u = -speedMs * Math.sin(rad)
  const v = -speedMs * Math.cos(rad)
  return { u, v }
}

// Nama kompas dari derajat
export function compassName(deg: number): string {
  const dirs = [
    'Utara',
    'Timur Laut',
    'Timur',
    'Tenggara',
    'Selatan',
    'Barat Daya',
    'Barat',
    'Barat Laut',
  ]
  const idx = Math.round(deg / 45) % 8
  return dirs[idx]
}

// Ringkasan outline pulau-pulau utama Indonesia (simplified polygon).
// Setiap pulau: array of [lng, lat] points.
// Koordinat diperkirakan dari peta umum; ketelitian rendah, cukup untuk konteks visual.
type Ring = [number, number][]

export const INDONESIA_ISLANDS: { name: string; rings: Ring[] }[] = [
  {
    name: 'Sumatra',
    rings: [
      [
        [95.5, 5.8],
        [97.0, 5.2],
        [99.5, 4.2],
        [101.5, 2.8],
        [103.8, 1.3],
        [105.2, 0.2],
        [105.8, -1.2],
        [105.6, -2.5],
        [104.5, -3.8],
        [103.2, -4.8],
        [101.8, -5.0],
        [100.5, -4.5],
        [99.0, -3.5],
        [98.0, -2.0],
        [96.5, -0.5],
        [95.5, 1.8],
        [95.2, 3.8],
        [95.5, 5.8],
      ],
    ],
  },
  {
    name: 'Jawa',
    rings: [
      [
        [105.2, -6.4],
        [106.8, -6.2],
        [108.8, -6.9],
        [111.0, -7.2],
        [112.8, -7.0],
        [114.2, -7.5],
        [114.5, -8.3],
        [114.3, -8.7],
        [112.8, -8.5],
        [111.2, -8.0],
        [109.0, -8.2],
        [107.0, -7.5],
        [105.5, -6.9],
        [105.2, -6.4],
      ],
    ],
  },
  {
    name: 'Bali',
    rings: [
      [
        [114.4, -8.2],
        [115.2, -8.05],
        [115.6, -8.4],
        [115.5, -8.75],
        [114.9, -8.8],
        [114.4, -8.5],
        [114.4, -8.2],
      ],
    ],
  },
  {
    name: 'Lombok',
    rings: [
      [
        [115.8, -8.1],
        [116.4, -8.3],
        [116.6, -8.7],
        [116.3, -9.0],
        [115.9, -8.9],
        [115.8, -8.5],
        [115.8, -8.1],
      ],
    ],
  },
  {
    name: 'Sumbawa',
    rings: [
      [
        [116.7, -8.2],
        [118.0, -8.4],
        [118.8, -8.6],
        [119.2, -8.9],
        [119.1, -9.2],
        [118.2, -9.1],
        [117.2, -8.9],
        [116.6, -8.6],
        [116.7, -8.2],
      ],
    ],
  },
  {
    name: 'Flores',
    rings: [
      [
        [119.4, -8.2],
        [120.8, -8.3],
        [122.0, -8.4],
        [122.5, -8.6],
        [122.3, -8.9],
        [121.2, -8.85],
        [120.0, -8.7],
        [119.3, -8.5],
        [119.4, -8.2],
      ],
    ],
  },
  {
    name: 'Timor',
    rings: [
      [
        [123.5, -8.5],
        [125.0, -8.6],
        [126.2, -8.6],
        [126.0, -9.2],
        [124.8, -9.4],
        [123.6, -9.3],
        [123.5, -8.9],
        [123.5, -8.5],
      ],
    ],
  },
  {
    name: 'Kalimantan',
    rings: [
      [
        [108.8, 4.2],
        [110.5, 4.2],
        [113.5, 3.8],
        [116.0, 3.0],
        [117.5, 2.0],
        [118.6, 1.0],
        [118.5, -0.5],
        [117.5, -1.5],
        [116.2, -2.0],
        [114.5, -2.5],
        [113.0, -2.7],
        [111.5, -2.5],
        [110.2, -1.8],
        [109.0, -0.5],
        [108.5, 1.2],
        [108.6, 2.8],
        [108.8, 4.2],
      ],
    ],
  },
  {
    name: 'Sulawesi',
    rings: [
      [
        [118.8, 1.5],
        [120.0, 1.8],
        [121.5, 1.2],
        [122.0, 0.2],
        [121.5, -0.8],
        [121.0, -1.5],
        [121.5, -2.5],
        [122.2, -3.2],
        [121.5, -4.0],
        [120.8, -3.8],
        [120.3, -3.0],
        [119.8, -2.2],
        [119.0, -1.8],
        [118.5, -1.0],
        [118.2, 0.2],
        [118.0, 1.0],
        [118.8, 1.5],
      ],
    ],
  },
  {
    name: 'Maluku Utara',
    rings: [
      [
        [126.5, 1.0],
        [128.0, 1.2],
        [128.5, 0.5],
        [128.2, -0.5],
        [127.0, -0.8],
        [126.4, -0.2],
        [126.5, 1.0],
      ],
    ],
  },
  {
    name: 'Halmahera',
    rings: [
      [
        [127.5, 2.2],
        [128.8, 1.8],
        [128.5, 0.5],
        [128.0, 0.2],
        [127.4, 0.8],
        [127.2, 1.8],
        [127.5, 2.2],
      ],
    ],
  },
  {
    name: 'Seram',
    rings: [
      [
        [128.0, -2.8],
        [129.5, -3.0],
        [131.0, -3.2],
        [131.2, -3.8],
        [130.0, -3.9],
        [128.5, -3.6],
        [128.0, -3.2],
        [128.0, -2.8],
      ],
    ],
  },
  {
    name: 'Papua',
    rings: [
      [
        [130.5, -1.0],
        [132.5, -1.2],
        [135.0, -1.5],
        [137.5, -1.8],
        [140.0, -2.5],
        [141.0, -3.5],
        [140.5, -5.0],
        [139.5, -6.0],
        [138.5, -7.5],
        [137.5, -8.5],
        [136.5, -8.2],
        [135.5, -7.0],
        [134.0, -6.0],
        [132.5, -5.0],
        [131.0, -4.0],
        [130.5, -2.5],
        [130.5, -1.0],
      ],
    ],
  },
]
