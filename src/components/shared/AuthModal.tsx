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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <i className="ti ti-x" style={{ fontSize: 18 }} />
        </button>

        <div className="mb-2 text-center text-xl font-semibold">
          <span className="text-gray-900">Prop</span>
          <span style={{ color: '#1D9E75' }}>XLA</span>
        </div>

        <h2 className="mb-1 text-center text-lg font-semibold text-gray-900">
          Unlock unlimited reports
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          You&apos;ve viewed 2 free reports. Sign in to continue — it&apos;s free and takes
          10 seconds.
        </p>

        <div className="mb-2 flex flex-col gap-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <i className="ti ti-check flex-shrink-0" style={{ color: '#0F6E56', fontSize: 16 }} />
              <span className="text-sm text-gray-600">{benefit}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onSignIn}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
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

        <p className="mt-3 text-center text-xs text-gray-400">
          Free forever · No credit card · No spam
        </p>
      </div>
    </div>
  )
}
