import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/volcanoes — daftar semua gunung api Indonesia
export async function GET() {
  try {
    const volcanoes = await db.volcano.findMany({
      orderBy: { officialName: 'asc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    })
    return NextResponse.json({
      count: volcanoes.length,
      volcanoes: volcanoes.map((v) => ({
        id: v.id,
        code: v.code,
        name: v.officialName,
        lat: v.lat,
        lng: v.lng,
        summitMAsl: v.summitMAsl,
        province: v.province,
        region: v.region,
        aviationColor: v.aviationColor,
        krStatus: v.krStatus,
        eventCount: v._count.events,
      })),
    })
  } catch (e) {
    console.error('GET /api/volcanoes error', e)
    return NextResponse.json({ error: 'Gagal memuat daftar gunung api' }, { status: 500 })
  }
}
