'use client'

import { XIcon, FileTextIcon, LayoutTemplateIcon } from '@/components/icons/NavIcons'
import { useTemplates } from '@/hooks/useTemplates'
import type { Json } from '@/types'

interface Props {
  onSelectBlank: () => void
  onSelectTemplate: (content: Json, name: string) => void
  onClose: () => void
}

export function NewNoteModal({ onSelectBlank, onSelectTemplate, onClose }: Props) {
  const { templates } = useTemplates()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-50 w-[340px] rounded-2xl p-5 shadow-2xl"
           style={{ background: 'var(--ds-surface-lowest)', border: '1px solid rgba(145,180,228,0.3)' }}>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ color: 'var(--ds-on-surface)' }}>
            Nueva nota
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:opacity-75"
            style={{ color: 'var(--ds-outline)' }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* En blanco */}
        <button
          onClick={onSelectBlank}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition mb-2"
          style={{ border: '2px solid var(--ds-primary)', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--ds-secondary-cnt)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
               style={{ background: 'var(--ds-secondary-cnt)' }}>
            <FileTextIcon size={18} style={{ color: 'var(--ds-primary)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--ds-on-surface)' }}>En blanco</p>
            <p className="text-xs" style={{ color: 'var(--ds-outline)' }}>Nota nueva sin contenido</p>
          </div>
        </button>

        {/* Plantillas */}
        {templates.length > 0 && (
          <>
            <div className="my-3 flex items-center gap-2">
              <LayoutTemplateIcon size={11} style={{ color: 'var(--ds-on-variant)' }} />
              <p className="text-[10px] font-semibold uppercase tracking-wider"
                 style={{ color: 'var(--ds-on-variant)' }}>
                Plantillas ({templates.length})
              </p>
            </div>
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTemplate(t.content, t.name)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left transition"
                  style={{ border: '1px solid rgba(145,180,228,0.3)', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(81,72,216,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                       style={{ background: 'var(--ds-secondary-cnt)' }}>
                    <LayoutTemplateIcon size={14} style={{ color: 'var(--ds-primary)' }} />
                  </div>
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--ds-on-surface)' }}>
                    {t.name}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
