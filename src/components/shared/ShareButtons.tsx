'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  url: string
  message: string
  label?: string
}

export default function ShareButtons({ url, message, label = 'Share report' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex w-full gap-2">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
        style={{ background: '#25D366', border: 'none' }}
      >
        <i className="ti ti-brand-whatsapp" />
        {label}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
        style={{
          background: 'rgba(255,255,255,0.10)',
          border: '0.5px solid rgba(255,255,255,0.15)',
        }}
      >
        <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} />
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
