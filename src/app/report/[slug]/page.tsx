import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAreaBySlug } from '@/lib/data'
import { getBrokerGap } from '@/lib/scoring'
import PropertyReport from '@/components/decision/PropertyReport'

interface ReportPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { slug } = await params
  const area = await getAreaBySlug(slug)

  if (!area) {
    return { title: 'Report not found · PropXLA' }
  }

  const gap = getBrokerGap(area)
  const title = `${area.name} Property Report · PropXLA`
  const description = `${area.name} scored ${area.overall_score}/100. Broker quoting ${gap}% above registered prices. Check flood risk and CRZ status.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://propxla.com/report/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { slug } = await params
  const area = await getAreaBySlug(slug)

  if (!area) {
    notFound()
  }

  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-2xl px-4 py-6">
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <a
        href="/"
        className="mb-4 flex items-center gap-1 text-xs hover:opacity-80"
        style={{ color: 'rgba(255,255,255,0.40)' }}
      >
        <i className="ti ti-arrow-left" />
        Back to PropXLA
      </a>
      <h1 className="mb-1 text-lg font-medium text-white">
        {area.name} · Property Intelligence Report
      </h1>
      <p className="mb-4 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
        Default scoring for investment intent. Visit PropXLA to change intent and
        recalculate.
      </p>
      <PropertyReport area={area} intent="investment" address={area.name} />
    </div>
  )
}
