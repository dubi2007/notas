'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/services/templates'
import type { Template, Json } from '@/types'

export function useTemplates() {
  const user = useAppStore((s) => s.user)
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    if (!user) return
    let isActive = true
    fetchTemplates().then((data) => {
      if (isActive) setTemplates(data)
    }).catch(() => {
      // tabla templates no existe aún — ignorar silenciosamente
    })
    return () => {
      isActive = false
    }
  }, [user])

  const handleCreate = useCallback(async (name: string, content: Json = {}) => {
    try {
      const t = await createTemplate(name, content)
      setTemplates((prev) => [...prev, t])
      return t
    } catch { return null }
  }, [])

  const handleUpdate = useCallback(async (id: string, partial: Partial<Pick<Template, 'name' | 'content'>>) => {
    try {
      await updateTemplate(id, partial)
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...partial } : t)))
    } catch { /* noop */ }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch { /* noop */ }
  }, [])

  return { templates: user ? templates : [], handleCreate, handleUpdate, handleDelete }
}
