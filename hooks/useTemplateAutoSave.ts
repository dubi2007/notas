'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { updateTemplate } from '@/services/templates'
import type { Json } from '@/types'

const DEBOUNCE_MS = 2500

interface Payload { templateId: string; name: string; content: Json }

export function useTemplateAutoSave() {
  const setSaveStatus = useAppStore((s) => s.setSaveStatus)

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')
  const isSavingRef  = useRef(false)

  const save = useCallback(async ({ templateId, name, content }: Payload) => {
    if (isSavingRef.current) return
    isSavingRef.current = true
    setSaveStatus('saving')
    try {
      await updateTemplate(templateId, { name, content })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    } finally {
      isSavingRef.current = false
    }
  }, [setSaveStatus])

  const triggerSave = useCallback((payload: Payload) => {
    const serialised = JSON.stringify(payload)
    if (serialised === lastSavedRef.current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      lastSavedRef.current = serialised
      save(payload)
    }, DEBOUNCE_MS)
  }, [save])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return { triggerSave }
}
