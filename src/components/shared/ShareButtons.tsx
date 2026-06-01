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
        className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <i className="ti ti-brand-whatsapp" style={{ color: '#25D366' }} />
        {label}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} />
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
