'use client'

type Tab = 'disc' | 'dec'

interface TabBarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS: Record<Tab, {
  icon: string
  title: string
  subtitle: string
  activeIconBg: string
}> = {
  disc: {
    icon: 'ti-map-search',
    title: 'Discovery',
    subtitle: 'Where should I buy?',
    activeIconBg: '#1D9E75',
  },
  dec: {
    icon: 'ti-building-community',
    title: 'Decision',
    subtitle: 'Should I buy this?',
    activeIconBg: '#185FA5',
  },
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div
      className="mb-4 grid grid-cols-2 overflow-hidden rounded-[14px]"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '0.5px solid rgba(255,255,255,0.10)',
      }}
    >
      {(Object.keys(TABS) as Tab[]).map((key, index) => {
        const tab = TABS[key]
        const isActive = activeTab === key

        return (
          <div key={key} className="flex items-center">
            {index === 1 && (
              <div
                className="w-px self-stretch"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              />
            )}
            <div
              onClick={() => onTabChange(key)}
              className="flex flex-1 cursor-pointer items-center gap-2 px-4 py-3"
              style={{
                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
              }}
            >
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                style={{
                  backgroundColor: isActive
                    ? tab.activeIconBg
                    : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                }}
              >
                <i className={`ti ${tab.icon}`} style={{ fontSize: 16 }} />
              </div>
              <div>
                <div
                  className={`text-sm ${isActive ? 'font-semibold text-white' : ''}`}
                  style={!isActive ? { color: 'rgba(255,255,255,0.40)' } : undefined}
                >
                  {tab.title}
                </div>
                <div
                  className="text-xs"
                  style={{
                    color: isActive
                      ? 'rgba(255,255,255,0.55)'
                      : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {tab.subtitle}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
