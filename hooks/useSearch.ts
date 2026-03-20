'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { searchNotes } from '@/services/notes'
import type { Note } from '@/types'

/**
 * Returns notes filtered by the global search query.
 * Uses local filtering for instant feedback, then can be
 * backed by a server search for larger datasets.
 */
export function useSearch(notes: Note[]) {
  const query = useAppStore((s) => s.searchQuery)

  const filtered = useMemo(() => {
    if (!query.trim()) return notes
    const q = query.toLowerCase()
    return notes.filter((n) => n.title.toLowerCase().includes(q))
  }, [notes, query])

  return { filtered, query }
}

export { searchNotes }
