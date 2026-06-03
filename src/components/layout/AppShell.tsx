'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AppShellProps {
  children: ReactNode
  showTopBar?: boolean
  topBarLeft?: ReactNode
  topBarCenter?: ReactNode
  topBarRight?: ReactNode
}

function DefaultLogo() {
  return (
    <div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'white',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        Prop<span style={{ color: '#1D9E75' }}>XLA</span>
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.40)',
          marginTop: 3,
          letterSpacing: '0.02em',
        }}
      >
        Know before you buy
      </div>
    </div>
  )
}

function DefaultAuthRight() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const emailLabel = user.email?.split('@')[0] ?? 'Signed in'

  return (
    <div className="flex items-center">
      <span
        className="rounded-full px-2 py-1 text-xs"
        style={{
          background: 'rgba(29,158,117,0.15)',
          border: '0.5px solid rgba(29,158,117,0.30)',
          color: '#5DCAA5',
        }}
      >
        {emailLabel}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        className="ml-2 text-xs transition-colors hover:text-white"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Sign out
      </button>
    </div>
  )
}

export default function AppShell({
  children,
  showTopBar = true,
  topBarLeft,
  topBarCenter,
  topBarRight,
}: AppShellProps) {
  return (
    <div className="relative z-10 min-h-screen">
      {showTopBar && (
        <header
          className="sticky top-0 z-50 flex items-center justify-between"
          style={{
            background: 'rgba(10, 30, 20, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '0.5px solid rgba(255,255,255,0.10)',
            padding: '10px 20px',
          }}
        >
          <div className="flex-shrink-0">{topBarLeft ?? <DefaultLogo />}</div>
          <div className="min-w-0 flex-1 px-3">{topBarCenter ?? <div />}</div>
          <div className="flex flex-shrink-0 items-center justify-end">
            {topBarRight ?? <DefaultAuthRight />}
          </div>
        </header>
      )}
      <div style={{ maxWidth: 896, margin: '0 auto', padding: '0 16px' }}>{children}</div>
    </div>
  )
}
