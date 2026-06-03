import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ComparePageClient from './ComparePageClient'
import { getAreaBySlug } from '@/lib/data'
import { computeScore } from '@/lib/scoring'
import type { Intent } from '@/lib/types'

interface ComparePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ intent?: string }>
}

function parseCompareSlugs(slug: string): { slug1: string; slug2: string } | null {
  const parts = slug.split('-vs-')
  if (parts.length < 2) return null
  const slug1 = parts[0]
  const slug2 = parts.slice(1).join('-vs-')
  if (!slug1 || !slug2) return null
  return { slug1, slug2 }
}

function resolveIntent(intentParam: string | undefined): Intent {
  const intent = intentParam || 'investment'
  if (
    intent === 'retirement' ||
    intent === 'investment' ||
    intent === 'vacation' ||
    intent === 'rental'
  ) {
    return intent
  }
  return 'investment'
}

export async function generateMetadata({
  params,
  searchParams,
}: ComparePageProps): Promise<Metadata> {
  const { slug } = await params
  const { intent: intentParam } = await searchParams
  const parsed = parseCompareSlugs(slug)

  if (!parsed) {
    return { title: 'Compare · PropXLA' }
  }

  const { slug1, slug2 } = parsed
  const [area1, area2] = await Promise.all([
    getAreaBySlug(slug1),
    getAreaBySlug(slug2),
  ])

  if (!area1 || !area2) {
    return { title: 'Compare · PropXLA' }
  }

  const intent = resolveIntent(intentParam)
  const score1 = computeScore(area1, intent).overall
  const score2 = computeScore(area2, intent).overall
  const winnerName = score1 >= score2 ? area1.name : area2.name

  const title = `${area1.name} vs ${area2.name} · PropXLA Compare`
  const description = `${area1.name} (${score1}/100) vs ${area2.name} (${score2}/100) for ${intent}. ${winnerName} is the better pick.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://propxla.com/compare/${slug}?intent=${intent}`,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function ComparePage({ params, searchParams }: ComparePageProps) {
  const { slug } = await params
  const { intent: intentParam } = await searchParams
  const parsed = parseCompareSlugs(slug)

  if (!parsed) {
    notFound()
  }

  const { slug1, slug2 } = parsed
  const [area1, area2] = await Promise.all([
    getAreaBySlug(slug1),
    getAreaBySlug(slug2),
  ])

  if (!area1 || !area2) {
    notFound()
  }

  const intent = resolveIntent(intentParam)

  return <ComparePageClient area1={area1} area2={area2} intent={intent} />
}
