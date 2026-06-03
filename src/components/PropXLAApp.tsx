'use client'

import { useState } from 'react'
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
}

export default function PropXLAApp({ areas }: PropXLAAppProps) {
  const [activeTab, setActiveTab] = useState<'disc' | 'dec'>('disc')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const { showAuthModal, setShowAuthModal, signInWithGoogle } = useAuth()

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
          <DiscoveryPanel areas={areas} onAreaSelect={handleAreaSelect} />
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
