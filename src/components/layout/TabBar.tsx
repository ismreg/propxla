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
  activeIconColor: string
}> = {
  disc: {
    icon: 'ti-map-search',
    title: 'Discovery',
    subtitle: 'Where should I buy?',
    activeIconBg: '#E1F5EE',
    activeIconColor: '#0F6E56',
  },
  dec: {
    icon: 'ti-building-community',
    title: 'Decision',
    subtitle: 'Should I buy this?',
    activeIconBg: '#E6F1FB',
    activeIconColor: '#185FA5',
  },
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="grid grid-cols-2 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 mb-4">
      {(Object.keys(TABS) as Tab[]).map((key, index) => {
        const tab = TABS[key]
        const isActive = activeTab === key

        return (
          <div key={key} className="flex items-center">
            {index === 1 && <div className="w-px bg-gray-200 self-stretch" />}
            <div
              onClick={() => onTabChange(key)}
              className={`flex flex-1 items-center gap-2 px-4 py-3 cursor-pointer ${
                isActive ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                  isActive ? '' : 'bg-gray-100 text-gray-400'
                }`}
                style={{
                  backgroundColor: isActive ? tab.activeIconBg : undefined,
                  color: isActive ? tab.activeIconColor : undefined,
                }}
              >
                <i className={`ti ${tab.icon}`} style={{ fontSize: 16 }} />
              </div>
              <div>
                <div
                  className={`text-sm font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {tab.title}
                </div>
                <div
                  className={`text-xs ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
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
