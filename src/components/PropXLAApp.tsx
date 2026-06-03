'use client'

import { useEffect, useState } from 'react'
import type { Area } from '@/lib/types'
import AppShell from '@/components/layout/AppShell'
import TabBar from '@/components/layout/TabBar'
import DiscoveryPanel from '@/components/discovery/DiscoveryPanel'
import DecisionPanel from '@/components/decision/DecisionPanel'
import AuthModal from '@/components/shared/AuthModal'
import { useAuth } from '@/hooks/useAuth'

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
  initialAreaSlug?: string | null
}

export default function PropXLAApp({ areas, initialAreaSlug = null }: PropXLAAppProps) {
  const hasInitialArea = Boolean(
    initialAreaSlug && areas.some((area) => area.slug === initialAreaSlug)
  )
  const [activeTab, setActiveTab] = useState<'disc' | 'dec'>(hasInitialArea ? 'dec' : 'disc')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    hasInitialArea ? initialAreaSlug : null
  )
  const [initialCompareSlug, setInitialCompareSlug] = useState<string | null>(null)

  const { showAuthModal, setShowAuthModal, signInWithGoogle } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const compareSlug = params.get('compare')
    const tab = params.get('tab')

    if (compareSlug && areas.some((a) => a.slug === compareSlug)) {
      setSelectedSlug(compareSlug)
      setActiveTab('disc')
      setInitialCompareSlug(compareSlug)
    }

    if (tab === 'decision') {
      setActiveTab('dec')
    }
  }, [areas])

  function handleAreaSelect(slug: string) {
    const area = areas.find((a) => a.slug === slug)
    logSearch({ area_slug: slug, corridor: area?.corridor })
    setSelectedSlug(slug)
    setActiveTab('dec')
  }

  function handleIntentSelect(intent: string) {
    logSearch({ area_slug: selectedSlug ?? undefined, intent })
  }

  return (
    <AppShell>
      <div style={{ paddingTop: '16px', paddingBottom: '40px' }}>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'disc' && (
          <DiscoveryPanel
            areas={areas}
            onAreaSelect={handleAreaSelect}
            initialCompareSlug={initialCompareSlug}
          />
        )}
        {activeTab === 'dec' && (
          <DecisionPanel
            areas={areas}
            initialSlug={selectedSlug}
            onIntentSelect={handleIntentSelect}
          />
        )}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignIn={signInWithGoogle}
        />
      </div>
    </AppShell>
  )
}
