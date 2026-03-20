'use client'

import { useEffect } from 'react'
import { onAuthStateChange } from '@/lib/auth'
import { useAppStore } from '@/store/useAppStore'

/**
 * Subscribes to Supabase auth state changes and keeps the global
 * store in sync. Mount this once at the top of the component tree.
 */
export function useAuthListener() {
  const setUser = useAppStore((s) => s.setUser)

  useEffect(() => {
    const subscription = onAuthStateChange((user) => {
      setUser(user)
    })
    return () => subscription.unsubscribe()
  }, [setUser])
}
