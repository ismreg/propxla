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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      {user && (
        <div className="-mx-4 mb-4 flex items-center justify-between border-b border-[#C0DD97] bg-[#F0FAF5] px-4 py-1.5">
          <span className="text-xs text-[#3B6D11]">
            <i className="ti ti-circle-check mr-1" />
            Signed in as {user.email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-[#3B6D11] underline"
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
