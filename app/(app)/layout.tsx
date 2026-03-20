import { Sidebar } from '@/components/sidebar/Sidebar'
import { MobileHeader } from '@/components/sidebar/MobileHeader'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col md:flex-row overflow-hidden" style={{ background: 'var(--ds-surface)' }}>
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
