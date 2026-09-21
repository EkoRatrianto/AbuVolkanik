import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/events — daftar kejadian erupsi
// Query opsional: ?status=active & bbox=minLng,minLat,maxLng,maxLat
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bbox = searchParams.get('bbox') // minLng,minLat,maxLng,maxLat

    const events = await db.eruptionEvent.findMany({
      orderBy: { onsetAt: 'desc' },
      include: {
        volcano: true,
        documents: {
          orderBy: { issuedAt: 'desc' },
        },
        observations: {
          orderBy: { observedAt: 'desc' },
        },
        modelRuns: {
          orderBy: { startedAt: 'desc' },
          include: {
            footprints: true,
          },
        },
      },
    })

    let filtered = events
    if (bbox) {
      const parts = bbox.split(',').map(Number)
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        const [minLng, minLat, maxLng, maxLat] = parts
        filtered = events.filter(
          (e) =>
            e.volcano.lng >= minLng &&
            e.volcano.lng <= maxLng &&
            e.volcano.lat >= minLat &&
            e.volcano.lat <= maxLat
        )
      }
    }

    return NextResponse.json({
      count: filtered.length,
      events: filtered.map((e) => ({
        id: e.id,
        onsetAt: e.onsetAt,
        endAt: e.endAt,
        status: e.status,
        aviationColor: e.aviationColor,
        summary: e.summary,
        volcano: {
          id: e.volcano.id,
          code: e.volcano.code,
          name: e.volcano.officialName,
          lat: e.volcano.lat,
          lng: e.volcano.lng,
          summitMAsl: e.volcano.summitMAsl,
          province: e.volcano.province,
          region: e.volcano.region,
          krStatus: e.volcano.krStatus,
        },
        evidenceCount: e.observations.length + e.documents.length,
        hasModelRun: e.modelRuns.length > 0,
        latestObservation: pickLatestObservation(e.observations),
      })),
    })
  } catch (e) {
    console.error('GET /api/events error', e)
    return NextResponse.json({ error: 'Gagal memuat daftar kejadian' }, { status: 500 })
  }
}

// Prioritaskan notice resmi vulkanologi (OBS-VOLCANO / OBS-GROUND / OBS-SAT)
// di atas advisory penerbangan (ADV-AIRSPACE) saat memilih "latest observation"
// untuk ringkasan daftar — agar kolom abu yang ditampilkan merepresentasikan
// observasi vulkanologi resmi, bukan polygon VAAC atmosfer per flight level.
function pickLatestObservation(obs: Array<{
  evidenceType: string
  ashTopMAsl: number | null
  movementText: string | null
  method: string
  observedAt: Date
  confidence: string
  conflict: string | null
}>) {
  if (!obs || obs.length === 0) return null
  const priority = ['OBS-VOLCANO', 'OBS-GROUND', 'OBS-SAT', 'ADV-AIRSPACE', 'MODEL-TRAJ', 'MODEL-DISP', 'REPORT-UNVERIFIED', 'FCST-MET']
  const sorted = [...obs].sort((a, b) => {
    const pa = priority.indexOf(a.evidenceType)
    const pb = priority.indexOf(b.evidenceType)
    if (pa !== pb) return pa - pb
    return b.observedAt.getTime() - a.observedAt.getTime()
  })
  const o = sorted[0]
  return {
    ashTopMAsl: o.ashTopMAsl,
    movementText: o.movementText,
    method: o.method,
    observedAt: o.observedAt,
    confidence: o.confidence,
    hasConflict: !!o.conflict,
  }
}
