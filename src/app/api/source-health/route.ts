import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/source-health — kesehatan konektor sumber data
export async function GET() {
  try {
    const sources = await db.sourceRegistry.findMany({
      orderBy: { sourceId: 'asc' },
      include: {
        ingestLogs: {
          orderBy: { fetchedAt: 'desc' },
          take: 1,
        },
      },
    })

    const now = Date.now()

    const result = sources.map((s) => {
      const lastLog = s.ingestLogs[0]
      const lastFetchedMs = s.lastFetchedAt ? s.lastFetchedAt.getTime() : 0
      const ageMs = now - lastFetchedMs
      const ageHours = ageMs / (1000 * 60 * 60)

      // Tentukan status kesehatan berdasarkan 4 dimensi:
      // konektivitas, validitas skema, freshness, kelengkapan
      let health: 'green' | 'yellow' | 'red'
      if (s.connectivityStatus === 'failed') {
        health = 'red'
      } else if (s.connectivityStatus === 'stale') {
        health = 'yellow'
      } else if (s.connectivityStatus === 'unverified') {
        health = 'yellow'
      } else if (ageHours > 24 && s.expectedCadence.includes('menit')) {
        health = 'red'
      } else if (ageHours > 12) {
        health = 'yellow'
      } else {
        health = 'green'
      }

      return {
        sourceId: s.sourceId,
        owner: s.owner,
        format: s.format,
        license: s.license,
        purpose: s.purpose,
        expectedCadence: s.expectedCadence,
        legalStatus: s.legalStatus,
        connectivityStatus: s.connectivityStatus,
        attribution: s.attribution,
        notes: s.notes,
        docsUrl: s.docsUrl,
        endpoint: s.endpoint,
        health,
        lastVerifiedAt: s.lastVerifiedAt,
        lastFetchedAt: s.lastFetchedAt,
        ageHours: Math.round(ageHours * 10) / 10,
        lastLog: lastLog
          ? {
              runId: lastLog.runId,
              connector: lastLog.connector,
              httpStatus: lastLog.httpStatus,
              latencyMs: lastLog.latencyMs,
              counts: lastLog.counts,
              errorClass: lastLog.errorClass,
              fetchedAt: lastLog.fetchedAt,
            }
          : null,
      }
    })

    const summary = {
      total: result.length,
      green: result.filter((r) => r.health === 'green').length,
      yellow: result.filter((r) => r.health === 'yellow').length,
      red: result.filter((r) => r.health === 'red').length,
      legalApproved: result.filter((r) => r.legalStatus === 'approved').length,
      legalPending: result.filter((r) => r.legalStatus === 'pending').length,
    }

    return NextResponse.json({ summary, sources: result })
  } catch (e) {
    console.error('GET /api/source-health error', e)
    return NextResponse.json({ error: 'Gagal memuat kesehatan sumber' }, { status: 500 })
  }
}
