'use client'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSignIn: () => void
}

const BENEFITS = [
  'Unlimited area reports',
  'Save and compare properties',
  'Get alerts when area scores change',
] as const

export default function AuthModal({ isOpen, onClose, onSignIn }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="relative w-full max-w-sm rounded-[20px] p-6"
        style={{
          background: '#0F2D1E',
          border: '0.5px solid rgba(255,255,255,0.15)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          aria-label="Close"
        >
          <i className="ti ti-x" style={{ fontSize: 18 }} />
        </button>

        <div className="mb-2 text-center text-xl font-semibold">
          <span className="text-white">Prop</span>
          <span style={{ color: '#1D9E75' }}>NXT</span>
        </div>

        <h2 className="mb-1 text-center text-lg font-semibold text-white">
          Unlock unlimited reports
        </h2>
        <p
          className="mb-6 text-center text-sm"
          style={{ color: 'rgba(255,255,255,0.50)' }}
        >
          You&apos;ve viewed 2 free reports. Sign in to continue — it&apos;s free and takes
          10 seconds.
        </p>

        <div className="mb-2 flex flex-col gap-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <i
                className="ti ti-check flex-shrink-0"
                style={{ color: '#1D9E75', fontSize: 16 }}
              />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {benefit}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onSignIn}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium text-white transition-colors"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '0.5px solid rgba(255,255,255,0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path
              fill="#4285F4"
              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"
            />
            <path
              fill="#34A353"
              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"
            />
            <path
              fill="#4285F4"
              d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"
            />
            <path
              fill="#FBBC02"
              d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"
            />
          </svg>
          Continue with Google
        </button>

        <p
          className="mt-3 text-center text-xs"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Free forever · No credit card · No spam
        </p>
      </div>
    </div>
  )
}
