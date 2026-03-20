'use client'

import { useEffect } from 'react'
import { useAuthListener } from '@/hooks/useAuth'
import { getCurrentUser } from '@/lib/auth'
import { useAppStore } from '@/store/useAppStore'

/**
 * Bootstraps auth state on mount and subscribes to changes.
 * Render once at the root of the component tree.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAppStore((s) => s.setUser)

  // Sync initial user
  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u ? { id: u.id, email: u.email } : null)
    })
  }, [setUser])

  // Subscribe to ongoing auth changes
  useAuthListener()

  return <>{children}</>
}
