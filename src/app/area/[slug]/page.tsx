import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import PropertyReport from '@/components/decision/PropertyReport'
import { getAreaBySlug, getAreasByCorridor } from '@/lib/data'
import { getBrokerGap } from '@/lib/scoring'
import { AREA_COORDINATES, CORRIDORS } from '@/lib/constants'
import type { Area } from '@/lib/types'

interface AreaPageProps {
  params: Promise<{ slug: string }>
}

function formatFloodRisk(floodRisk: Area['flood_risk']): string {
  return floodRisk.replace(/_/g, ' ')
}

function buildIntroParagraph(area: Area, gap: number): string {
  const corridorLabel = CORRIDORS[area.corridor].label
  return `${area.name} is located on the ${corridorLabel}, ${area.distance_from_city} km from Chennai Central. Registered sale prices average ₹${area.reg_avg_psf.toLocaleString('en-IN')}/sqft while brokers quote ₹${area.broker_ask_psf.toLocaleString('en-IN')}/sqft — a ${gap}% premium. PropNXT rates ${area.name} ${area.overall_score}/100 based on price truth, flood risk, metro connectivity, and IT corridor proximity.`
}

function buildJsonLd(area: Area) {
  const coords = AREA_COORDINATES[area.slug]
  const latitude = coords ? coords[1] : 12.9
  const longitude = coords ? coords[0] : 80.2

  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${area.name}, Chennai`,
    description: `Property intelligence report for ${area.name}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    },
  }
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { slug } = await params
  const area = await getAreaBySlug(slug)

  if (!area) {
    return { title: 'Area not found · PropNXT' }
  }

  const gap = getBrokerGap(area)
  const title = `${area.name} Property Price 2024 · Registered Rates & Investment Score`
  const description = `${area.name} registered property price: ₹${area.reg_avg_psf.toLocaleString('en-IN')}/sqft. Broker asking ₹${area.broker_ask_psf.toLocaleString('en-IN')}/sqft — ${gap}% premium. Flood risk: ${formatFloodRisk(area.flood_risk)}. PropNXT score: ${area.overall_score}/100.`

  return {
    title,
    description,
    keywords: [
      `${area.name} property price`,
      `${area.name} property price per sqft`,
      `${area.name} registered price 2024`,
      `${area.name} investment score`,
      `${area.name} flood risk`,
      `${area.name} property rate Chennai`,
      `buy property ${area.name}`,
      `${area.corridor.toUpperCase()} corridor Chennai property`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://propxla.com/area/${slug}`,
    },
  }
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { slug } = await params
  const area = await getAreaBySlug(slug)

  if (!area) {
    notFound()
  }

  const gap = getBrokerGap(area)
  const corridorAreas = await getAreasByCorridor(area.corridor)
  const relatedAreas = corridorAreas
    .filter((candidate) => candidate.slug !== area.slug)
    .slice(0, 3)

  const jsonLd = buildJsonLd(area)
  const defaultIntent = 'investment'

  return (
    <AppShell>
      <article style={{ paddingTop: 16, paddingBottom: 80 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <h1 className="text-2xl font-bold text-white">
          {area.name} Property Intelligence Report 2024
        </h1>

        <p
          className="mt-4 text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          {buildIntroParagraph(area, gap)}
        </p>

        <div className="mt-8">
          <PropertyReport area={area} intent={defaultIntent} address={area.name} />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={`/?area=${area.slug}`}
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#1D9E75' }}
          >
            Check this property
          </Link>
        </div>

        {relatedAreas.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-white">Compare with nearby areas</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedAreas.map((related) => (
                <Link
                  key={related.slug}
                  href={`/area/${related.slug}`}
                  className="rounded-2xl p-4 transition-colors hover:opacity-90"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '0.5px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <div className="text-sm font-semibold text-white">{related.name}</div>
                  <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {related.corridor.toUpperCase()} · Score {related.overall_score}/100
                  </div>
                  <div className="mt-2 text-xs" style={{ color: '#5DCAA5' }}>
                    ₹{related.reg_avg_psf.toLocaleString('en-IN')}/sqft registered
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </AppShell>
  )
}
