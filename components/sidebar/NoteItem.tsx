'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import type { Note } from '@/types'

interface Props {
  note: Note
  onDelete: (id: string) => void
}

export function NoteItem({ note, onDelete }: Props) {
  const router = useRouter()
  const activeNote = useAppStore((s) => s.activeNote)
  const setActiveNote = useAppStore((s) => s.setActiveNote)

  const isActive = activeNote === note.id

  const handleClick = () => {
    setActiveNote(note.id)
    router.push(`/notes/${note.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="group relative flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition"
      style={{
        color: isActive ? 'var(--ds-primary)' : 'var(--ds-on-variant)',
        background: isActive ? 'rgba(81,72,216,0.07)' : 'transparent',
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(5,52,92,0.04)' }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      {/* Active left pill */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
              style={{ background: 'var(--ds-primary)' }} />
      )}
      <span className={`truncate ${isActive ? 'font-medium' : ''}`}>
        {note.title || 'Sin título'}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar esta nota?')) onDelete(note.id) }}
        className="hidden rounded p-0.5 text-xs opacity-50 hover:opacity-100 group-hover:block"
        style={{ color: 'var(--ds-on-variant)' }}
        title="Eliminar nota"
      >✕</button>
    </div>
  )
}
