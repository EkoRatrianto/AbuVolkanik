import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/events/[id] — detail kejadian dengan timeline, observasi, model run, footprint, exposure
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await db.eruptionEvent.findUnique({
      where: { id },
      include: {
        volcano: true,
        documents: {
          orderBy: { issuedAt: 'asc' },
        },
        observations: {
          orderBy: { observedAt: 'asc' },
        },
        modelRuns: {
          orderBy: { startedAt: 'asc' },
          include: {
            footprints: {
              include: {
                exposures: {
                  include: {
                    adminUnit: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Kejadian tidak ditemukan' }, { status: 404 })
    }

    // Bangun timeline terurut dari documents + observations + modelRuns
    const timeline = [
      ...event.documents.map((d) => ({
        kind: 'document' as const,
        at: d.issuedAt,
        type: d.type,
        evidenceType: d.evidenceType,
        url: d.url,
        externalId: d.externalId,
        revision: d.revision,
        rawSummary: d.rawSummary,
      })),
      ...event.observations.map((o) => ({
        kind: 'observation' as const,
        at: o.observedAt,
        evidenceType: o.evidenceType,
        ashTopMAsl: o.ashTopMAsl,
        ashTopOriginal: o.ashTopOriginal,
        ashAboveSummitM: o.ashAboveSummitM,
        movementToDeg: o.movementToDeg,
        movementFromDeg: o.movementFromDeg,
        movementText: o.movementText,
        method: o.method,
        confidence: o.confidence,
        conflict: o.conflict,
      })),
      ...event.modelRuns.map((m) => ({
        kind: 'model_run' as const,
        at: m.startedAt,
        modelVersion: m.modelVersion,
        configHash: m.configHash,
        metProvider: m.metProvider,
        metCycleAt: m.metCycleAt,
        finishedAt: m.finishedAt,
        status: m.status,
        isUnitSource: m.isUnitSource,
      })),
    ].sort((a, b) => a.at.getTime() - b.at.getTime())

    // Footprints untuk peta (polygon + trajectory)
    const footprints = event.modelRuns.flatMap((m) =>
      m.footprints.map((f) => ({
        runId: m.id,
        modelVersion: m.modelVersion,
        validFrom: f.validFrom,
        validTo: f.validTo,
        verticalBand: f.verticalBand,
        metric: f.metric,
        value: f.value,
        nMembers: f.nMembers,
        nIntersect: f.nIntersect,
        geometry: JSON.parse(f.polygonGeoJson),
        exposures: f.exposures.map((ex) => ({
          adminUnit: {
            code: ex.adminUnit.code,
            name: ex.adminUnit.name,
            province: ex.adminUnit.province,
            lat: ex.adminUnit.lat,
            lng: ex.adminUnit.lng,
          },
          overlapAreaKm2: ex.overlapAreaKm2,
          ratio: ex.ratio,
          populationProxy: ex.populationProxy,
          isConfirmed: ex.isConfirmed,
          methodVersion: ex.methodVersion,
        })),
      }))
    )

    // Pisahkan footprint (polygon) vs trajectory (line)
    const polygons = footprints.filter((f) => f.geometry.type === 'Polygon')
    const trajectories = footprints.filter((f) => f.geometry.type === 'LineString')

    // Exposure = wilayah berpotensi terlintasi (BUKAN konfirmasi)
    const allExposures = footprints.flatMap((f) =>
      f.exposures.map((ex) => ({ ...ex, metric: f.metric, validFrom: f.validFrom, validTo: f.validTo }))
    )
    const potentialAreas = allExposures.filter((e) => !e.isConfirmed)
    const confirmedAreas = allExposures.filter((e) => e.isConfirmed)

    return NextResponse.json({
      event: {
        id: event.id,
        onsetAt: event.onsetAt,
        endAt: event.endAt,
        status: event.status,
        aviationColor: event.aviationColor,
        summary: event.summary,
        volcano: {
          id: event.volcano.id,
          code: event.volcano.code,
          name: event.volcano.officialName,
          lat: event.volcano.lat,
          lng: event.volcano.lng,
          summitMAsl: event.volcano.summitMAsl,
          province: event.volcano.province,
          region: event.volcano.region,
          krStatus: event.volcano.krStatus,
        },
      },
      timeline,
      documents: event.documents,
      observations: event.observations,
      modelRuns: event.modelRuns.map((m) => ({
        id: m.id,
        modelVersion: m.modelVersion,
        configHash: m.configHash,
        metProvider: m.metProvider,
        metCycleAt: m.metCycleAt,
        startedAt: m.startedAt,
        finishedAt: m.finishedAt,
        status: m.status,
        isUnitSource: m.isUnitSource,
        assumptions: JSON.parse(m.assumptions),
      })),
      footprints: polygons,
      trajectories,
      potentialAreas,
      confirmedAreas,
      // Pesan kunci
      messages: {
        modelLabel: 'INDIKASI MODEL — bukan peringatan resmi',
        notAConfirmation:
          'Hasil footprint sensitif terhadap durasi erupsi, tinggi kolom, source term, dan siklus cuaca. Belum ada konfirmasi jatuhan abu.',
        unitSource:
          event.modelRuns.some((m) => m.isUnitSource)
            ? 'Run memakai sumber satuan 1 g (HYSPLIT default) karena laju emisi abu tidak diketahui. Hanya menghasilkan footprint RELATIF/probabilistik, BUKAN konsentrasi atau ketebalan endapan.'
            : null,
      },
    })
  } catch (e) {
    console.error('GET /api/events/[id] error', e)
    return NextResponse.json({ error: 'Gagal memuat detail kejadian' }, { status: 500 })
  }
}
