'use client'

import { useState } from 'react'
import type { Area } from '@/lib/types'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import DiscoveryPanel from '@/components/discovery/DiscoveryPanel'
import DecisionPanel from '@/components/decision/DecisionPanel'

async function logSearch(data: {
  area_slug?: string
  intent?: string
  corridor?: string
  budget_lakhs?: number
}) {
  fetch('/api/log-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {})
}

interface PropXLAAppProps {
  areas: Area[]
}

export default function PropXLAApp({ areas }: PropXLAAppProps) {
  const [activeTab, setActiveTab] = useState<'disc' | 'dec'>('disc')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'disc' ? (
        <DiscoveryPanel
          areas={areas}
          onAreaSelect={(slug) => {
            const area = areas.find((a) => a.slug === slug)
            logSearch({ area_slug: slug, corridor: area?.corridor })
            setSelectedSlug(slug)
            setActiveTab('dec')
          }}
        />
      ) : (
        <DecisionPanel
          areas={areas}
          initialSlug={selectedSlug}
          onIntentSelect={(intent) => {
            logSearch({ area_slug: selectedSlug ?? undefined, intent })
          }}
        />
      )}
    </div>
  )
}
