'use client'

import { useCallback, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  fetchNotes,
  createNote,
  deleteNote,
} from '@/services/notes'

export function useNotes(folderId: string | null) {
  const user = useAppStore((s) => s.user)
  const notes = useAppStore((s) => s.notes)
  const setNotes = useAppStore((s) => s.setNotes)
  const addNote = useAppStore((s) => s.addNote)
  const removeNote = useAppStore((s) => s.removeNote)

  // Load notes for the active folder
  useEffect(() => {
    if (!user) {
      setNotes([])
      return
    }
    fetchNotes(folderId).then(setNotes).catch(console.error)
  }, [user, folderId, setNotes])

  const notesForFolder = folderId
    ? notes.filter((n) => n.folder_id === folderId)
    : notes

  const handleCreate = useCallback(
    async (fid: string | null, initialContent?: import('@/types').Json) => {
      const note = await createNote(fid, initialContent)
      addNote(note)
      return note
    },
    [addNote],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteNote(id)
      removeNote(id)
    },
    [removeNote],
  )

  return { notes: notesForFolder, allNotes: notes, handleCreate, handleDelete }
}
