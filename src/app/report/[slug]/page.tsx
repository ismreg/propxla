import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAreaBySlug } from '@/lib/data'
import { getBrokerGap } from '@/lib/scoring'
import { INTENTS } from '@/lib/constants'
import type { Intent } from '@/lib/types'
import ReportPageClient from './ReportPageClient'

interface ReportPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ intent?: string }>
}

const VALID_INTENTS: Intent[] = ['retirement', 'investment', 'vacation', 'rental']

function parseIntent(intentParam: string | undefined): Intent {
  if (intentParam && VALID_INTENTS.includes(intentParam as Intent)) {
    return intentParam as Intent
  }
  return 'investment'
}

export async function generateMetadata({
  params,
  searchParams,
}: ReportPageProps): Promise<Metadata> {
  const { slug } = await params
  const { intent: intentParam } = await searchParams
  const area = await getAreaBySlug(slug)

  if (!area) {
    return { title: 'Report not found · PropXLA' }
  }

  const intent = parseIntent(intentParam)
  const intentLabel = INTENTS[intent]?.label ?? intent
  const gap = getBrokerGap(area)
  const title = `${area.name} Property Report · PropXLA`
  const description = `${area.name} scored ${area.overall_score}/100 for ${intentLabel.toLowerCase()}. Broker quoting ${gap}% above registered prices. Check flood risk and CRZ status.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://propxla.com/report/${slug}?intent=${intent}`,
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { slug } = await params
  const { intent: intentParam } = await searchParams
  const area = await getAreaBySlug(slug)

  if (!area) {
    notFound()
  }

  const intent = parseIntent(intentParam)

  return <ReportPageClient area={area} intent={intent} />
}
