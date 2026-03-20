'use client'

import { useAppStore } from '@/store/useAppStore'

const LABELS: Record<string, string> = {
  idle: '',
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'Error al guardar',
}

const COLORS: Record<string, string> = {
  idle: 'text-transparent',
  saving: 'text-zinc-400',
  saved: 'text-emerald-500',
  error: 'text-red-500',
}

export function SaveStatus() {
  const status = useAppStore((s) => s.saveStatus)
  return (
    <span
      className={`text-xs font-medium transition-colors duration-300 ${COLORS[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
