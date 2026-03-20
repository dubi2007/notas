'use client'

import { useAppStore } from '@/store/useAppStore'
import { ListViewIcon } from '@/components/icons/NavIcons'

export function MobileHeader() {
  const setSidebarOpen = useAppStore(s => s.setSidebarOpen)

  return (
    <div className="flex h-[60px] shrink-0 items-center justify-between border-b px-4 md:hidden"
         style={{ background: 'var(--ds-surface)', borderColor: 'rgba(145,180,228,0.12)' }}>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:opacity-75 active:opacity-60"
          style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)' }}
        >
          <ListViewIcon size={20} />
        </button>
      </div>
      <div className="text-sm font-bold tracking-tight" style={{ color: 'var(--ds-on-surface)' }}>
        Apuntes Fáciles
      </div>
      <div className="w-10" /> {/* Spacer to center the title */}
    </div>
  )
}
