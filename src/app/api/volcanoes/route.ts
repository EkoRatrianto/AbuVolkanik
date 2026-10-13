import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const FALLBACK_VOLCANOES = [
  { id: 'fb-sem', code: 'SEM', name: 'Semeru', lat: -8.108, lng: 112.922, summitMAsl: 3676, province: 'Jawa Timur', region: 'Jawa', aviationColor: 'ORANGE', krStatus: 'Level III', eventCount: 1 },
  { id: 'fb-krak', code: 'KRAK', name: 'Anak Krakatau', lat: -6.102, lng: 105.423, summitMAsl: 157, province: 'Lampung', region: 'Sunda', aviationColor: 'YELLOW', krStatus: 'Level III', eventCount: 1 },
  { id: 'fb-mer', code: 'MER', name: 'Merapi', lat: -7.541, lng: 110.446, summitMAsl: 2910, province: 'DI Yogyakarta', region: 'Jawa', aviationColor: 'ORANGE', krStatus: 'Level III', eventCount: 0 },
  { id: 'fb-sin', code: 'SIN', name: 'Sinabung', lat: 3.17, lng: 98.392, summitMAsl: 2460, province: 'Sumatera Utara', region: 'Sumatra', aviationColor: 'YELLOW', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-agung', code: 'AGUNG', name: 'Agung', lat: -8.343, lng: 115.508, summitMAsl: 3142, province: 'Bali', region: 'Sunda Kecil', aviationColor: 'YELLOW', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-rin', code: 'RIN', name: 'Rinjani', lat: -8.412, lng: 116.458, summitMAsl: 3726, province: 'Nusa Tenggara Barat', region: 'Sunda Kecil', aviationColor: 'YELLOW', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-bro', code: 'BRO', name: 'Bromo', lat: -7.942, lng: 112.953, summitMAsl: 2329, province: 'Jawa Timur', region: 'Jawa', aviationColor: 'YELLOW', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-kel', code: 'KEL', name: 'Kelud', lat: -7.933, lng: 112.308, summitMAsl: 1731, province: 'Jawa Timur', region: 'Jawa', aviationColor: 'GREEN', krStatus: 'Level I', eventCount: 0 },
  { id: 'fb-duk', code: 'DUK', name: 'Dukono', lat: 1.686, lng: 127.89, summitMAsl: 1335, province: 'Maluku Utara', region: 'Maluku', aviationColor: 'ORANGE', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-ibu', code: 'IBU', name: 'Ibu', lat: 1.483, lng: 127.63, summitMAsl: 1340, province: 'Maluku Utara', region: 'Maluku', aviationColor: 'ORANGE', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-lew', code: 'LEW', name: 'Lewotobi', lat: -8.536, lng: 122.775, summitMAsl: 1703, province: 'Nusa Tenggara Timur', region: 'Sunda Kecil', aviationColor: 'ORANGE', krStatus: 'Level III', eventCount: 1 },
  { id: 'fb-ill', code: 'ILL', name: 'Ili Lewotolok', lat: -8.275, lng: 123.474, summitMAsl: 1423, province: 'Nusa Tenggara Timur', region: 'Sunda Kecil', aviationColor: 'YELLOW', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-mar', code: 'MAR', name: 'Marapi', lat: -0.381, lng: 100.474, summitMAsl: 2891, province: 'Sumatera Barat', region: 'Sumatra', aviationColor: 'YELLOW', krStatus: 'Level II', eventCount: 0 },
  { id: 'fb-ker', code: 'KER', name: 'Kerinci', lat: -1.697, lng: 101.264, summitMAsl: 3800, province: 'Jambi', region: 'Sumatra', aviationColor: 'GREEN', krStatus: 'Level I', eventCount: 0 },
  { id: 'fb-slm', code: 'SLM', name: 'Slamet', lat: -7.243, lng: 109.208, summitMAsl: 3432, province: 'Jawa Tengah', region: 'Jawa', aviationColor: 'GREEN', krStatus: 'Level I', eventCount: 0 },
  { id: 'fb-smb', code: 'SMB', name: 'Sumbing', lat: -7.378, lng: 110.073, summitMAsl: 3371, province: 'Jawa Tengah', region: 'Jawa', aviationColor: 'GREEN', krStatus: 'Level I', eventCount: 0 },
  { id: 'fb-tal', code: 'TAL', name: 'Tambora', lat: -8.25, lng: 118.0, summitMAsl: 2850, province: 'Nusa Tenggara Barat', region: 'Sunda Kecil', aviationColor: 'GREEN', krStatus: 'Level I', eventCount: 0 },
  { id: 'fb-suk', code: 'SUK', name: 'Sangeang Api', lat: -8.2, lng: 119.075, summitMAsl: 1949, province: 'Nusa Tenggara Barat', region: 'Sunda Kecil', aviationColor: 'GREEN', krStatus: 'Level I', eventCount: 0 },
]

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

    if (!volcanoes || volcanoes.length === 0) {
      return NextResponse.json({
        count: FALLBACK_VOLCANOES.length,
        volcanoes: FALLBACK_VOLCANOES,
      })
    }

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
    console.warn('GET /api/volcanoes falling back to static registry due to DB error:', e)
    return NextResponse.json({
      count: FALLBACK_VOLCANOES.length,
      volcanoes: FALLBACK_VOLCANOES,
    })
  }
}
