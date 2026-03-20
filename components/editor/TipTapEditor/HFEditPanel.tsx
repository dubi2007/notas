'use client'

import { useRef } from 'react'

interface Props {
  zone:         'header' | 'footer'
  defaultValue: string
  onSave:       (value: string) => void
  onClose:      () => void
}

export function HFEditPanel({ zone, defaultValue, onSave, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-2xl">
      <span className="shrink-0 select-none text-xs font-medium text-zinc-500">
        {zone === 'header' ? '▲ Encabezado' : '▼ Pie de página'}
      </span>
      <input
        key={zone}
        ref={inputRef}
        defaultValue={defaultValue}
        onBlur={(e) => onSave(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.blur()}
        placeholder={zone === 'footer' ? 'Texto · usa {page} y {total}' : 'Encabezado…'}
        className="w-64 border-b border-indigo-300 pb-0.5 text-sm text-zinc-700 outline-none"
        autoFocus
      />
      <button
        className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSave(inputRef.current?.value ?? '')}
      >
        Guardar
      </button>
      <button
        className="shrink-0 text-xs text-zinc-400 hover:text-zinc-600"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  )
}
