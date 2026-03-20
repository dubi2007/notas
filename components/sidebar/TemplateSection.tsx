'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutTemplateIcon, PlusIcon, ChevronRightIcon, ChevronDownIcon, TrashIcon } from '@/components/icons/NavIcons'
import { useTemplates } from '@/hooks/useTemplates'
import { useNotes } from '@/hooks/useNotes'
import { useAppStore } from '@/store/useAppStore'
import type { Json } from '@/types'

export function TemplateSection({ hideHeader = false }: { hideHeader?: boolean }) {
  const router = useRouter()
  const { templates, handleCreate, handleDelete } = useTemplates()
  const { handleCreate: createNote } = useNotes(null)
  const activeFolder = useAppStore((s) => s.activeFolder)

  const [open, setOpen] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCreateBlank = async () => {
    const name = newName.trim()
    if (!name) return
    const t = await handleCreate(name)
    setNewName('')
    setCreating(false)
    if (t) router.push(`/templates/${t.id}`)
  }

  const handleUse = async (content: Json) => {
    const note = await createNote(activeFolder, content)
    router.push(`/notes/${note.id}`)
  }

  return (
    <div>
      {/* Section header — shown only when not embedded in a parent header */}
      {!hideHeader && (
        <div
          className="flex cursor-pointer items-center justify-between px-2 py-2.5"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="flex items-center gap-1.5">
            <LayoutTemplateIcon size={12} strokeWidth={2.5} style={{ color: 'var(--ds-on-variant)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--ds-on-variant)' }}>
              Plantillas
            </span>
            {templates.length > 0 && (
              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                    style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)' }}>
                {templates.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Nueva plantilla"
              onClick={(e) => { e.stopPropagation(); setCreating(true); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
              className="flex h-6 w-6 items-center justify-center rounded-lg transition hover:opacity-75"
              style={{ color: 'var(--ds-primary)', background: 'var(--ds-secondary-cnt)' }}
            >
              <PlusIcon size={13} strokeWidth={2.5} />
            </button>
            <span style={{ color: 'var(--ds-outline)' }}>
              {open ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
            </span>
          </div>
        </div>
      )}

      {/* When hideHeader, show inline "+ Nueva plantilla" button */}
      {hideHeader && (
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[10px]" style={{ color: 'var(--ds-outline)' }}>
            {templates.length === 0 ? 'Sin plantillas' : `${templates.length} plantilla${templates.length > 1 ? 's' : ''}`}
          </span>
          <button
            title="Nueva plantilla"
            onClick={() => { setCreating(true); setTimeout(() => inputRef.current?.focus(), 50) }}
            className="flex h-5 w-5 items-center justify-center rounded-md transition hover:opacity-75"
            style={{ color: 'var(--ds-primary)', background: 'var(--ds-secondary-cnt)' }}
          >
            <PlusIcon size={11} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {(open || hideHeader) && (
        <div className="flex flex-col gap-0.5 px-1">
          {/* New template input */}
          {creating && (
            <div className="flex gap-1.5 px-1 pb-1">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBlank()
                  if (e.key === 'Escape') { setCreating(false); setNewName('') }
                }}
                placeholder="Nombre de plantilla"
                className="input-curator flex-1 px-3 py-1.5 text-sm"
                style={{ color: 'var(--ds-on-surface)' }}
              />
              <button onClick={handleCreateBlank} className="btn-primary px-3 py-1.5 text-xs">✓</button>
            </div>
          )}

          {templates.length === 0 && !creating && (
            <p className="px-3 py-1.5 text-xs italic" style={{ color: 'var(--ds-outline)' }}>
              Sin plantillas
            </p>
          )}

          {templates.map((t) => (
            <div
              key={t.id}
              className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition"
              style={{ color: 'var(--ds-on-surface)' }}
              onClick={() => router.push(`/templates/${t.id}`)}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(5,52,92,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              <LayoutTemplateIcon size={12} strokeWidth={1.8} className="shrink-0" style={{ color: 'var(--ds-on-variant)' }} />
              <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
              <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                <button
                  title="Usar plantilla"
                  onClick={e => { e.stopPropagation(); handleUse(t.content) }}
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition hover:opacity-80"
                  style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)' }}
                >
                  Usar
                </button>
                <button
                  title="Eliminar plantilla"
                  onClick={e => { e.stopPropagation(); if (confirm(`¿Eliminar "${t.name}"?`)) handleDelete(t.id) }}
                  className="flex h-5 w-5 items-center justify-center rounded transition opacity-40 hover:opacity-100 hover:text-red-400"
                >
                  <TrashIcon size={10} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
