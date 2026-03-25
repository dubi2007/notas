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
  const pendingPayloadRef = useRef<Payload | null>(null)

  const save = useCallback(async ({ templateId, name, content }: Payload) => {
    const payload = { templateId, name, content }
    if (isSavingRef.current) {
      pendingPayloadRef.current = payload
      return
    }
    isSavingRef.current = true
    setSaveStatus('saving')
    try {
      await updateTemplate(templateId, { name, content })
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
  }, [setSaveStatus])

  const triggerSave = useCallback((payload: Payload) => {
    const serialised = JSON.stringify(payload)
    if (serialised === lastSavedRef.current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void save(payload)
    }, DEBOUNCE_MS)
  }, [save])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return { triggerSave }
}
