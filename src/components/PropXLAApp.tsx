'use client'

import { useState } from 'react'
import type { Area } from '@/lib/types'
import Header from '@/components/layout/Header'
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

  const {
    user,
    showAuthModal,
    setShowAuthModal,
    trackReport,
    signInWithGoogle,
    signOut,
  } = useAuth()

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 py-0">
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <Header />
      {user && (
        <div className="-mx-4 mb-4 flex items-center justify-between border-b border-[rgba(29,158,117,0.3)] bg-[rgba(29,158,117,0.15)] px-4 py-1.5">
          <span className="text-xs text-[#5DCAA5]">
            <i className="ti ti-circle-check mr-1" />
            Signed in as {user.email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-[#9FE1CB] underline"
          >
            Sign out
          </button>
        </div>
      )}
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
          onReportView={trackReport}
          onIntentSelect={(intent) => {
            logSearch({ area_slug: selectedSlug ?? undefined, intent })
          }}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signInWithGoogle}
      />
    </div>
  )
}
