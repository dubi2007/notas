'use client'

import { useState } from 'react'
import { Mark, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/react'

// ── Preset colors ──────────────────────────────────────────────────────────────
const COLORS = [
  { label: 'Amarillo',    value: '#fef08a' },
  { label: 'Verde',       value: '#bbf7d0' },
  { label: 'Celeste',     value: '#bae6fd' },
  { label: 'Rosa',        value: '#fecdd3' },
  { label: 'Naranja',     value: '#fed7aa' },
  { label: 'Morado',      value: '#e9d5ff' },
  { label: 'Rojo',        value: '#fca5a5' },
  { label: 'Gris',        value: '#e5e7eb' },
  { label: 'Sin resaltar', value: 'none'   },
]

// ── TipTap Mark extension ──────────────────────────────────────────────────────
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textHighlight: {
      setTextHighlight:    (color: string) => ReturnType
      unsetTextHighlight:  ()              => ReturnType
      toggleTextHighlight: (color: string) => ReturnType
    }
  }
}

export const TextHighlight = Mark.create({
  name: 'textHighlight',
  excludes: '_',   // can coexist with other marks

  addAttributes() {
    return {
      color: {
        default: '#fef08a',
        parseHTML: el => (el as HTMLElement).style.backgroundColor || '#fef08a',
        renderHTML: attrs => ({ style: `background-color:${attrs.color};border-radius:2px;padding:0 1px;` }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'mark' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setTextHighlight: (color: string) => ({ commands }) =>
        commands.setMark(this.name, { color }),
      unsetTextHighlight: () => ({ commands }) =>
        commands.unsetMark(this.name),
      toggleTextHighlight: (color: string) => ({ commands }) =>
        commands.toggleMark(this.name, { color }),
    }
  },
})

// ── HighlightButton component ──────────────────────────────────────────────────
interface HighlightButtonProps { editor: Editor }

export function HighlightButton({ editor }: HighlightButtonProps) {
  const [open, setOpen] = useState(false)
  const isActive = editor.isActive('textHighlight')

  const apply = (color: string) => {
    if (color === 'none') {
      editor.chain().focus().unsetTextHighlight().run()
    } else {
      editor.chain().focus().toggleTextHighlight(color).run()
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        title="Resaltar texto"
        onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v) }}
        className="flex h-7 w-7 items-center justify-center rounded-lg transition"
        style={{
          color:      isActive ? 'var(--ds-primary)' : 'var(--ds-on-variant)',
          background: isActive ? 'var(--ds-secondary-cnt)' : 'transparent',
        }}
      >
        {/* "A" with colored underline — classic highlight icon */}
        <span className="relative">
          A
          <span className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-sm bg-yellow-300" />
        </span>
        {' '}▾
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* picker */}
          <div className="absolute left-0 top-full z-50 mt-1 rounded-xl p-2"
               style={{ background: 'var(--ds-surface-lowest)', border: '1px solid rgba(145,180,228,0.3)', boxShadow: 'var(--ds-shadow)' }}>
            <p className="mb-1.5 select-none text-[10px] font-medium" style={{ color: 'var(--ds-outline)' }}>Resaltar</p>
            <div className="grid grid-cols-4 gap-1">
              {COLORS.filter(c => c.value !== 'none').map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onMouseDown={(e) => { e.preventDefault(); apply(c.value) }}
                  className="h-6 w-6 rounded hover:scale-110 transition-transform"
                  style={{ border: '1px solid rgba(145,180,228,0.4)', backgroundColor: c.value }}
                />
              ))}
            </div>

            <div className="mt-1.5 flex items-center gap-1.5">
              {/* custom color */}
              <input
                type="color"
                defaultValue="#fef08a"
                title="Color personalizado"
                onMouseDown={e => e.stopPropagation()}
                onChange={e => apply(e.target.value)}
                className="h-6 w-6 cursor-pointer rounded"
                style={{ border: '1px solid rgba(145,180,228,0.4)' }}
              />
              <span className="text-[10px]" style={{ color: 'var(--ds-outline)' }}>Personalizado</span>

              <button
                onMouseDown={(e) => { e.preventDefault(); apply('none') }}
                className="ml-auto rounded px-1.5 py-0.5 text-[10px] transition"
                style={{ color: 'var(--ds-on-variant)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--ds-secondary-cnt)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                title="Quitar resaltado"
              >
                ✕ Quitar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
