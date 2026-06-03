'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportCount, setReportCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    const count = parseInt(localStorage.getItem('propxla_report_count') || '0', 10)
    setReportCount(count)

    return () => subscription.unsubscribe()
  }, [supabase])

  const trackReport = useCallback((): boolean => {
    if (user) return true

    let allowed = true
    setReportCount((prev) => {
      const newCount = prev + 1
      localStorage.setItem('propxla_report_count', newCount.toString())
      if (newCount > 2) {
        setShowAuthModal(true)
        allowed = false
      }
      return newCount
    })
    return allowed
  }, [user])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    localStorage.removeItem('propxla_report_count')
    setReportCount(0)
  }

  return {
    user,
    loading,
    showAuthModal,
    setShowAuthModal,
    trackReport,
    signInWithGoogle,
    signOut,
  }
}
