'use client'

import dynamic from 'next/dynamic'
import type { Note } from '@/types'

// TipTap must be loaded client-side (no SSR — it uses browser APIs)
const TipTapEditor = dynamic(
  () => import('@/components/editor/TipTapEditor').then((m) => m.TipTapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-zinc-400">Cargando editor…</span>
      </div>
    ),
  },
)

export function NoteEditorShell({ note }: { note: Note }) {
  return (
    <div className="h-full overflow-hidden">
      <TipTapEditor key={note.id} note={note} />
    </div>
  )
}
