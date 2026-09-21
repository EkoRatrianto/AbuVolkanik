import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/wind-profile?eventId=...
// Mengembalikan profil angin multilapis dari asumsi model run event
// (simulasi data GFS/Open-Meteo pressure level — BUKAN observasi aktual)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId wajib' }, { status: 400 })
    }

    const event = await db.eruptionEvent.findUnique({
      where: { id: eventId },
      include: {
        volcano: true,
        modelRuns: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Kejadian tidak ditemukan' }, { status: 404 })
    }

    const latestRun = event.modelRuns[0]
    let windLevels: Array<{
      pressureHpa: number
      zMAsl: number
      windFromDeg: number
      speedMs: number
      precipMm: number
    }> = []

    if (latestRun) {
      const assumptions = JSON.parse(latestRun.assumptions)
      windLevels = assumptions.windLevels ?? []
    }

    // Default fallback bila tidak ada data
    if (windLevels.length === 0) {
      windLevels = [
        { pressureHpa: 1000, zMAsl: 110, windFromDeg: 200, speedMs: 3.2, precipMm: 0.1 },
        { pressureHpa: 925, zMAsl: 760, windFromDeg: 210, speedMs: 4.5, precipMm: 0.0 },
        { pressureHpa: 850, zMAsl: 1450, windFromDeg: 220, speedMs: 6.8, precipMm: 0.2 },
        { pressureHpa: 700, zMAsl: 3010, windFromDeg: 230, speedMs: 9.1, precipMm: 0.0 },
        { pressureHpa: 500, zMAsl: 5600, windFromDeg: 250, speedMs: 14.2, precipMm: 0.0 },
      ]
    }

    const summitMAsl = event.volcano.summitMAsl
    const terrainMAsl = summitMAsl // aproksimasi: terrain di gunung = summit

    // Saring level bawah tanah: level dengan z <= terrain tidak disajikan
    const visibleLevels = windLevels.filter((l) => l.zMAsl > terrainMAsl + 50)

    return NextResponse.json({
      volcano: {
        name: event.volcano.officialName,
        summitMAsl,
        lat: event.volcano.lat,
        lng: event.volcano.lng,
      },
      metProvider: latestRun?.metProvider ?? 'GFS 0.25° (default)',
      metCycleAt: latestRun?.metCycleAt ?? null,
      label: 'PRAKIRAAN METEOROLOGI',
      allLevels: windLevels,
      visibleLevels,
      hiddenBelowGround: windLevels.filter((l) => l.zMAsl <= terrainMAsl + 50),
      terrainMAsl,
      // Hitung u/v + arah gerak untuk setiap level
      levels: visibleLevels.map((l) => {
        const rad = (l.windFromDeg * Math.PI) / 180
        const u = -l.speedMs * Math.sin(rad)
        const v = -l.speedMs * Math.cos(rad)
        const moveToDeg = (l.windFromDeg + 180) % 360
        return {
          ...l,
          u,
          v,
          moveToDeg,
          aglM: l.zMAsl - terrainMAsl,
        }
      }),
      note:
        'Pressure level BUKAN tinggi tetap. Nilai seperti 925 hPa ≈ 800 m ASL hanya orientasi. Perhitungan memakai geopotential height dari model. Level bawah tanah disembunyikan.',
    })
  } catch (e) {
    console.error('GET /api/wind-profile error', e)
    return NextResponse.json({ error: 'Gagal memuat profil angin' }, { status: 500 })
  }
}
