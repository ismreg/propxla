'use client'

import { useEffect, useState } from 'react'
import type { AdminAreaSummary, ParsedAreaUpdate } from '@/lib/admin-types'

interface AdminUpdateClientProps {
  adminKey: string
}

function adminHeaders(adminKey: string): HeadersInit {
  return { 'x-admin-key': adminKey, 'Content-Type': 'application/json' }
}

function formatFieldValue(value: unknown): string {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

export default function AdminUpdateClient({ adminKey }: AdminUpdateClientProps) {
  const [selectedSlug, setSelectedSlug] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [parsedData, setParsedData] = useState<ParsedAreaUpdate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [allAreas, setAllAreas] = useState<AdminAreaSummary[]>([])
  const [areasLoading, setAreasLoading] = useState(true)

  const selectedArea = allAreas.find((area) => area.slug === selectedSlug)

  useEffect(() => {
    async function loadAreas() {
      try {
        const res = await fetch('/api/admin/areas', {
          headers: { 'x-admin-key': adminKey },
        })
        if (!res.ok) {
          throw new Error('Failed to load areas')
        }
        const data = (await res.json()) as AdminAreaSummary[]
        setAllAreas(data)
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load areas')
        setSaveStatus('error')
      } finally {
        setAreasLoading(false)
      }
    }

    loadAreas()
  }, [adminKey])

  async function callParseAPI() {
    if (!selectedSlug || !rawInput.trim() || !selectedArea) return

    setIsLoading(true)
    setSaveStatus('idle')
    setErrorMessage('')
    setParsedData(null)

    try {
      const res = await fetch('/api/admin/parse-area', {
        method: 'POST',
        headers: adminHeaders(adminKey),
        body: JSON.stringify({
          slug: selectedSlug,
          rawInput,
          currentArea: selectedArea,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Parse failed')
      }

      setParsedData(data as ParsedAreaUpdate)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Parse failed')
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  async function callSaveAPI() {
    if (!selectedSlug || !parsedData) return

    setIsSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      const res = await fetch('/api/admin/save-area', {
        method: 'POST',
        headers: adminHeaders(adminKey),
        body: JSON.stringify({ slug: selectedSlug, updates: parsedData }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Save failed')
      }

      setSaveStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Save failed')
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              Prop<span style={{ color: '#5DCAA5' }}>XLA</span>
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: 'rgba(186,117,23,0.20)',
                color: '#FAC775',
                border: '0.5px solid rgba(186,117,23,0.40)',
              }}
            >
              Data Admin
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Internal tool · Not for public use
          </p>
        </header>

        {saveStatus === 'success' && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              background: 'rgba(29,158,117,0.20)',
              border: '0.5px solid rgba(29,158,117,0.40)',
              color: '#5DCAA5',
            }}
          >
            Saved successfully
          </div>
        )}

        {saveStatus === 'error' && errorMessage && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(226,75,74,0.15)',
              border: '0.5px solid rgba(226,75,74,0.30)',
              color: '#F09595',
            }}
          >
            {errorMessage}
          </div>
        )}

        <section className="mb-6">
          <label className="mb-2 block text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Select area to update
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => {
              setSelectedSlug(e.target.value)
              setParsedData(null)
              setSaveStatus('idle')
            }}
            className="w-full px-3 py-2.5 text-sm text-white"
            disabled={areasLoading}
          >
            <option value="">
              {areasLoading ? 'Loading areas...' : 'Choose an area'}
            </option>
            {allAreas.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.name} ({area.corridor.toUpperCase()}) · {area.overall_score}/100
              </option>
            ))}
          </select>
        </section>

        <section className="mb-6">
          <label className="mb-2 block text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Paste raw data from Zapkey or any source
          </label>
          <p className="mb-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Copy any format — transaction table, price list, or plain text. AI will parse it
            automatically.
          </p>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Paste anything — examples:

2BHK, 1100 sqft, Mar 2024, ₹67L, 6091/sqft
3BHK, 1450 sqft, Feb 2024, ₹89L, 6138/sqft

Or: Registered avg price ₹6,100/sqft
Broker asking ₹7,400/sqft

Or paste a table copied from Zapkey directly.`}
            className="w-full resize-y px-3 py-3 font-mono text-xs text-white"
            style={{ height: 200, lineHeight: 1.5 }}
          />
          <button
            type="button"
            onClick={callParseAPI}
            disabled={isLoading || !selectedSlug || !rawInput.trim()}
            className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: 'rgba(29,158,117,0.80)', border: 'none' }}
          >
            {isLoading ? 'Parsing with AI...' : 'Parse with AI →'}
          </button>
        </section>

        {parsedData && (
          <section>
            <label className="mb-2 block text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Parsed data preview — verify before saving
            </label>
            <div className="glass rounded-xl p-4">
              <div className="flex flex-col gap-3">
                {Object.entries(parsedData).map(([field, value]) => (
                  <div key={field}>
                    <div
                      className="mb-1 text-[10px] uppercase tracking-wide"
                      style={{ color: 'rgba(255,255,255,0.30)' }}
                    >
                      {field}
                    </div>
                    <pre
                      className="whitespace-pre-wrap break-words text-xs text-white"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {formatFieldValue(value)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={callSaveAPI}
              disabled={isSaving}
              className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #1D9E75, #185FA5)',
                border: 'none',
              }}
            >
              {isSaving ? 'Saving...' : 'Save to Supabase ✓'}
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
