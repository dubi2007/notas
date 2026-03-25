'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { updateNote } from '@/services/notes'
import type { Json } from '@/types'

const DEBOUNCE_MS = 2500

interface AutoSavePayload {
  noteId: string
  title: string
  content: Json
}

/**
 * Debounced autosave hook.
 * Saves only when content actually changed (compared via JSON serialisation).
 * Returns a `triggerSave` function to call on every editor change.
 */
export function useAutoSave() {
  const setSaveStatus = useAppStore((s) => s.setSaveStatus)
  const updateNoteStore = useAppStore((s) => s.updateNote)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')
  const isSavingRef = useRef(false)
  const pendingPayloadRef = useRef<AutoSavePayload | null>(null)

  const save = useCallback(
    async ({ noteId, title, content }: AutoSavePayload) => {
      const payload = { noteId, title, content }
      if (isSavingRef.current) {
        pendingPayloadRef.current = payload
        return
      }
      isSavingRef.current = true
      setSaveStatus('saving')

      try {
        await updateNote(noteId, { title, content })
        updateNoteStore(noteId, { title, content })
        lastSavedRef.current = JSON.stringify(payload)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
      } finally {
        isSavingRef.current = false
        const pendingPayload = pendingPayloadRef.current
        pendingPayloadRef.current = null
        if (pendingPayload) {
          const pendingSerialised = JSON.stringify(pendingPayload)
          if (pendingSerialised !== lastSavedRef.current) {
            void save(pendingPayload)
          }
        }
      }
    },
    [setSaveStatus, updateNoteStore],
  )

  const triggerSave = useCallback(
    (payload: AutoSavePayload) => {
      const serialised = JSON.stringify(payload)
      if (serialised === lastSavedRef.current) return // no real change

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void save(payload)
      }, DEBOUNCE_MS)
    },
    [save],
  )

  // Clean up timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return { triggerSave }
}
