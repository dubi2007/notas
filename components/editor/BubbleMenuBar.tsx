'use client'

import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'

function Btn({ label, title, active, onClick }: {
  label: string; title: string; active?: boolean; onClick: () => void
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`rounded px-1.5 py-0.5 text-xs font-semibold transition ${
        active ? 'bg-indigo-500 text-white' : 'text-zinc-700 hover:bg-zinc-100'
      }`}
    >
      {label}
    </button>
  )
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px flex-shrink-0 bg-zinc-200" />
}

export function BubbleMenuBar({ editor }: { editor: Editor }) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    const show = () => {
      const { from, to } = editor.state.selection
      if (from === to || editor.isActive('image') || editor.isActive('shapeFigure')) {
        setCoords(null)
        return
      }
      const start = editor.view.coordsAtPos(from)
      const end   = editor.view.coordsAtPos(to)
      setCoords({ top: start.top - 52, left: (start.left + end.left) / 2 })
    }
    const hide = () => setCoords(null)

    editor.on('selectionUpdate', show)
    editor.on('focus', show)
    editor.on('blur', hide)
    return () => {
      editor.off('selectionUpdate', show)
      editor.off('focus', show)
      editor.off('blur', hide)
    }
  }, [editor])

  if (!coords) return null

  return (
    <div
      style={{ position: 'fixed', top: coords.top, left: coords.left, transform: 'translateX(-50%)', zIndex: 9999 }}
      className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white px-1.5 py-1 shadow-xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      <Btn label="B"  title="Negrita"  active={editor.isActive('bold')}   onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn label="I"  title="Cursiva"  active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn label="S̶"  title="Tachado"  active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <Btn label="<>" title="Código"   active={editor.isActive('code')}   onClick={() => editor.chain().focus().toggleCode().run()} />

      <Sep />

      <Btn label="H1" title="Título 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <Btn label="H2" title="Título 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <Btn label="H3" title="Título 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />

      <Sep />

      <Btn label="❝"   title="Cita"             active={editor.isActive('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn label="•"   title="Lista con viñetas" active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn label="1."  title="Lista numerada"    active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <Btn label="{ }" title="Bloque de código"  active={editor.isActive('codeBlock')}   onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
    </div>
  )
}
