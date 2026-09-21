import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/wind-field?level=850
// Mengembalikan grid arah angin & cuaca nasional pada pressure level tertentu.
// Data bersifat SIMULASI deterministik berbasis pola umum sirkulasi atmosfer Indonesia
// (trade wind easterlies di selatan, monsoon, jet stream tinggi).
// BUKAN observasi aktual — label PRAKIRAAN METEOROLOGI, rujuk BMKG/NOAA untuk otoritatif.
//
// Pressure level standar: 1000, 925, 850, 700, 500, 300 hPa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const levelParam = searchParams.get('level') ?? '850'
    const level = parseInt(levelParam, 10)
    const validLevels = [1000, 925, 850, 700, 500, 300]
    const useLevel = validLevels.includes(level) ? level : 850

    // Grid bbox Indonesia
    const minLng = 95
    const maxLng = 141
    const minLat = -11
    const maxLat = 6
    const cols = 22
    const rows = 12
    const stepLng = (maxLng - minLng) / (cols - 1)
    const stepLat = (maxLat - minLat) / (rows - 1)

    const levelMeta = getLevelMeta(useLevel)

    const cells: Array<{
      lng: number
      lat: number
      windFromDeg: number
      speedMs: number
      precipMm: number
      cloudCover: number
      isConvective: boolean
    }> = []
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const lng = minLng + i * stepLng
        const lat = maxLat - j * stepLat

        // Komponen noise deterministik (stabil per koordinat+level)
        const seed = Math.sin(lng * 12.9898 + lat * 78.233 + useLevel * 3.7) * 43758.5453
        const noise = seed - Math.floor(seed)
        const noise2 = Math.sin(lng * 5.13 + lat * 2.71 + useLevel * 1.3) * 12345.6789
        const n2 = noise2 - Math.floor(noise2)

        // Arah angin "dari" (meteorologis) berdasarkan pola level + latitude
        let windFromDeg: number
        let speedMs: number
        let precipMm = 0
        let cloudCover = 0

        if (useLevel >= 700 && useLevel <= 500) {
          windFromDeg = 85 + noise * 40 - 20
          speedMs = 8 + noise * 6
        } else if (useLevel >= 850) {
          if (lat < 0) {
            windFromDeg = 110 + noise * 40 - 20
          } else {
            windFromDeg = 200 + noise * 50 - 25
          }
          speedMs = 3 + noise * 6
        } else {
          if (lat < -2) {
            windFromDeg = 265 + noise * 30 - 15
            speedMs = 18 + noise * 10
          } else if (lat > 2) {
            windFromDeg = 80 + noise * 30 - 15
            speedMs = 10 + noise * 8
          } else {
            windFromDeg = 270 + noise * 60 - 30
            speedMs = 14 + noise * 8
          }
        }

        const equatorFactor = Math.exp(-Math.pow(lat / 4, 2))
        const itcz = Math.exp(-Math.pow((lng - 120) / 14, 2))
        const baseRain = (equatorFactor * 0.6 + itcz * 0.5) * Math.max(0, 1 - (useLevel - 850) / 600)
        precipMm = Math.max(0, baseRain * 8 + noise * 2 - 0.5)
        cloudCover = Math.min(1, baseRain * 1.2 + noise * 0.3)

        const isConvective = precipMm > 4

        cells.push({
          lng: Math.round(lng * 100) / 100,
          lat: Math.round(lat * 100) / 100,
          windFromDeg: Math.round(windFromDeg),
          speedMs: Math.round(speedMs * 10) / 10,
          precipMm: Math.round(precipMm * 10) / 10,
          cloudCover: Math.round(cloudCover * 100) / 100,
          isConvective,
        })
      }
    }

    return NextResponse.json({
      level: useLevel,
      levelMeta,
      metProvider: 'GFS 0.25° (simulasi pola umum)',
      label: 'PRAKIRAAN METEOROLOGI — INDIKASI MODEL',
      note:
        'Grid arah angin & cuaca adalah simulasi deterministik berbasis pola sirkulasi atmosfer Indonesia (trade wind, monsoon, jet stream). BUKAN observasi aktual. Produksi harus pakai GFS/BMKG otoritatif.',
      bbox: { minLng, maxLng, minLat, maxLat },
      cols,
      rows,
      cells,
    })
  } catch (e) {
    console.error('GET /api/wind-field error', e)
    return NextResponse.json({ error: 'Gagal memuat grid angin' }, { status: 500 })
  }
}

function getLevelMeta(level: number) {
  switch (level) {
    case 1000:
      return { hpa: 1000, mAsl: 110, band: 'SFC', desc: 'Permukaan — angin dekat tanah' }
    case 925:
      return { hpa: 925, mAsl: 760, band: 'FL025', desc: 'Lapisan batas atmosfer (~750 m)' }
    case 850:
      return { hpa: 850, mAsl: 1450, band: 'FL050', desc: 'Lapisan batas atas (~1,5 km)' }
    case 700:
      return { hpa: 700, mAsl: 3010, band: 'FL100', desc: 'Menengah bawah (~3 km)' }
    case 500:
      return { hpa: 500, mAsl: 5600, band: 'FL185', desc: 'Menengah atas (~5,6 km)' }
    case 300:
      return { hpa: 300, mAsl: 9200, band: 'FL300', desc: 'Tinggi — jet stream (~9,2 km)' }
    default:
      return { hpa: level, mAsl: 0, band: 'unknown', desc: 'Level tidak dikenal' }
  }
}
