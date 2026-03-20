'use client'

import { useState } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus,
  Table, Shapes, Image,
  Undo2, Redo2, FileDown, FileText,
  IndentIncrease, IndentDecrease,
} from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { PAGE_FORMATS, type FormatKey } from './TipTapEditor'
import { SHAPE_LABELS, type ShapeType } from './ShapeExtension'
import { HighlightButton } from './TextHighlightExtension'

interface Props {
  editor: Editor
  onImageUpload: () => void
  format: FormatKey
  onFormatChange: (fmt: FormatKey) => void
  onExportPdf: () => void
  onExportWord: () => void
}

// ── Icon button ───────────────────────────────────────────────────────────────
function Btn({
  icon: Icon, title, active, disabled, onMouseDown,
}: {
  icon: React.ElementType; title: string; active?: boolean; disabled?: boolean
  onMouseDown: (e: React.MouseEvent) => void
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(e) }}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-30"
      style={{
        color:      active ? 'var(--ds-primary)' : 'var(--ds-on-variant)',
        background: active ? 'var(--ds-secondary-cnt)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active && !disabled) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(81,72,216,0.06)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  )
}

// ── Text label button ─────────────────────────────────────────────────────────
function TxtBtn({
  label, title, active, disabled, onMouseDown,
}: {
  label: string; title: string; active?: boolean; disabled?: boolean
  onMouseDown: (e: React.MouseEvent) => void
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(e) }}
      className="flex h-8 items-center rounded-lg px-2 text-xs font-medium transition disabled:opacity-30"
      style={{
        color:      active ? 'var(--ds-primary)' : 'var(--ds-on-variant)',
        background: active ? 'var(--ds-secondary-cnt)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active && !disabled) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(81,72,216,0.06)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      {label}
    </button>
  )
}

function Sep() {
  return <div className="mx-1 h-6 w-px flex-shrink-0 self-center" style={{ background: 'rgba(145,180,228,0.4)' }} />
}

// ── Text color button ─────────────────────────────────────────────────────────
const TEXT_COLORS = [
  { label: 'Negro',    value: '#05345c' },
  { label: 'Gris',     value: '#6b7280' },
  { label: 'Rojo',     value: '#ef4444' },
  { label: 'Naranja',  value: '#f97316' },
  { label: 'Amarillo', value: '#eab308' },
  { label: 'Verde',    value: '#22c55e' },
  { label: 'Azul',     value: '#3b82f6' },
  { label: 'Morado',   value: '#a855f7' },
]

function TextColorButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const currentColor = editor.getAttributes('textStyle').color ?? '#05345c'

  return (
    <div className="relative">
      <button
        title="Color de texto"
        onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v) }}
        className="flex h-8 w-8 flex-col items-center justify-center rounded-lg transition"
        style={{ color: 'var(--ds-on-variant)', background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(81,72,216,0.06)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
      >
        <span className="text-xs font-bold leading-none" style={{ color: currentColor }}>A</span>
        <span className="mt-0.5 h-1 w-4 rounded-sm" style={{ background: currentColor }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 rounded-xl p-2"
               style={{ background: 'var(--ds-surface-lowest)', border: '1px solid rgba(145,180,228,0.3)', boxShadow: 'var(--ds-shadow)' }}>
            <p className="mb-1.5 select-none text-[10px] font-medium" style={{ color: 'var(--ds-outline)' }}>Color de texto</p>
            <div className="grid grid-cols-4 gap-1">
              {TEXT_COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c.value).run(); setOpen(false) }}
                  className="h-6 w-6 rounded hover:scale-110 transition-transform"
                  style={{ border: '1px solid rgba(145,180,228,0.4)', backgroundColor: c.value }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                type="color"
                defaultValue={currentColor}
                title="Color personalizado"
                onMouseDown={e => e.stopPropagation()}
                onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                className="h-6 w-6 cursor-pointer rounded"
                style={{ border: '1px solid rgba(145,180,228,0.4)' }}
              />
              <span className="text-[10px]" style={{ color: 'var(--ds-outline)' }}>Personalizado</span>
              <button
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setOpen(false) }}
                className="ml-auto rounded px-1.5 py-0.5 text-[10px] transition"
                style={{ color: 'var(--ds-on-variant)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--ds-secondary-cnt)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
              >✕ Quitar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Table size picker ─────────────────────────────────────────────────────────
const MAX_GRID = 9

function TableSizePicker({ onSelect }: { onSelect: (rows: number, cols: number) => void }) {
  const [hover, setHover] = useState({ r: 0, c: 0 })

  return (
    <div className="p-2">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${MAX_GRID}, 1.25rem)` }}
        onMouseLeave={() => setHover({ r: 0, c: 0 })}
      >
        {Array.from({ length: MAX_GRID * MAX_GRID }).map((_, i) => {
          const r = Math.floor(i / MAX_GRID) + 1
          const c = (i % MAX_GRID) + 1
          const on = r <= hover.r && c <= hover.c
          return (
            <div
              key={i}
              className="h-5 w-5 rounded-sm cursor-pointer transition"
              style={{
                border:     `1px solid ${on ? 'var(--ds-primary)' : 'rgba(145,180,228,0.4)'}`,
                background: on ? 'var(--ds-secondary-cnt)' : 'rgba(239,244,255,0.6)',
              }}
              onMouseEnter={() => setHover({ r, c })}
              onClick={() => onSelect(hover.r, hover.c)}
            />
          )
        })}
      </div>
      <p className="mt-1.5 text-center text-[11px]" style={{ color: 'var(--ds-outline)' }}>
        {hover.r > 0 ? `${hover.r} × ${hover.c}` : 'Elige tamaño'}
      </p>
    </div>
  )
}

// ── Main Toolbar ──────────────────────────────────────────────────────────────
export function EditorToolbar({ editor, onImageUpload, format, onFormatChange, onExportPdf, onExportWord }: Props) {
  const [tablePickerOpen, setTablePickerOpen] = useState(false)
  const [shapesOpen, setShapesOpen] = useState(false)
  const inTable = editor.isActive('table')
  const inList  = editor.isActive('bulletList') || editor.isActive('orderedList')

  const insertShape = (shapeType: ShapeType) => {
    const isCircle = shapeType === 'circle'
    editor.chain().focus().insertContent({
      type: 'shapeFigure',
      attrs: {
        shapeType,
        width:  isCircle ? 140 : 180,
        height: isCircle ? 140 : 110,
        fill:   '#dbeafe',
        stroke: '#3b82f6',
      },
    }).scrollIntoView().run()
    setShapesOpen(false)
  }

  return (
    <div className="glass-bar relative flex flex-wrap items-center gap-0.5 px-3 py-2 sticky top-0 z-30"
         style={{ borderBottom: '1px solid rgba(145,180,228,0.25)' }}>

      {/* ── Text formatting ── */}
      <Btn icon={Bold}          title="Negrita (Ctrl+B)"    active={editor.isActive('bold')}      onMouseDown={() => editor.chain().focus().toggleBold().run()} />
      <Btn icon={Italic}        title="Cursiva (Ctrl+I)"    active={editor.isActive('italic')}    onMouseDown={() => editor.chain().focus().toggleItalic().run()} />
      <Btn icon={Underline}     title="Subrayado (Ctrl+U)"  active={editor.isActive('underline')} onMouseDown={() => editor.chain().focus().toggleUnderline().run()} />
      <Btn icon={Strikethrough} title="Tachado"             active={editor.isActive('strike')}    onMouseDown={() => editor.chain().focus().toggleStrike().run()} />
      <TextColorButton editor={editor} />
      <HighlightButton editor={editor} />

      <Sep />

      {/* ── Alignment ── */}
      <Btn icon={AlignLeft}    title="Alinear izquierda" active={editor.isActive({ textAlign: 'left' })}    onMouseDown={() => editor.chain().focus().setTextAlign('left').run()} />
      <Btn icon={AlignCenter}  title="Centrar"           active={editor.isActive({ textAlign: 'center' })}  onMouseDown={() => editor.chain().focus().setTextAlign('center').run()} />
      <Btn icon={AlignRight}   title="Alinear derecha"   active={editor.isActive({ textAlign: 'right' })}   onMouseDown={() => editor.chain().focus().setTextAlign('right').run()} />
      <Btn icon={AlignJustify} title="Justificar"        active={editor.isActive({ textAlign: 'justify' })} onMouseDown={() => editor.chain().focus().setTextAlign('justify').run()} />

      <Sep />

      {/* ── Headings ── */}
      <Btn icon={Heading1} title="Título 1" active={editor.isActive('heading', { level: 1 })} onMouseDown={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <Btn icon={Heading2} title="Título 2" active={editor.isActive('heading', { level: 2 })} onMouseDown={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <Btn icon={Heading3} title="Título 3" active={editor.isActive('heading', { level: 3 })} onMouseDown={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />

      <Sep />

      {/* ── Lists & indent ── */}
      <Btn icon={List}           title="Lista con viñetas" active={editor.isActive('bulletList')}  onMouseDown={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn icon={ListOrdered}    title="Lista numerada"    active={editor.isActive('orderedList')} onMouseDown={() => editor.chain().focus().toggleOrderedList().run()} />
      <Btn icon={IndentIncrease} title="Aumentar sangría"  disabled={!inList} onMouseDown={() => editor.chain().focus().sinkListItem('listItem').run()} />
      <Btn icon={IndentDecrease} title="Reducir sangría"   disabled={!inList} onMouseDown={() => editor.chain().focus().liftListItem('listItem').run()} />

      <Sep />

      {/* ── Blocks ── */}
      <Btn icon={Quote} title="Cita"             active={editor.isActive('blockquote')} onMouseDown={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn icon={Code}  title="Código inline"    active={editor.isActive('code')}       onMouseDown={() => editor.chain().focus().toggleCode().run()} />
      <Btn icon={Code2} title="Bloque de código" active={editor.isActive('codeBlock')}  onMouseDown={() => editor.chain().focus().toggleCodeBlock().run()} />
      <Btn icon={Minus} title="Separador"        onMouseDown={() => editor.chain().focus().setHorizontalRule().run()} />

      <Sep />

      {/* ── Table ── */}
      <div className="relative">
        <Btn
          icon={Table}
          title="Insertar tabla"
          active={tablePickerOpen || editor.isActive('table')}
          onMouseDown={(e) => { e.stopPropagation(); setTablePickerOpen((v) => !v); setShapesOpen(false) }}
        />
        {tablePickerOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setTablePickerOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 rounded-xl shadow-xl"
                 style={{ background: 'var(--ds-surface-lowest)', border: '1px solid rgba(145,180,228,0.3)', boxShadow: 'var(--ds-shadow)' }}>
              <TableSizePicker
                onSelect={(r, c) => {
                  if (r > 0 && c > 0) {
                    editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).scrollIntoView().run()
                  }
                  setTablePickerOpen(false)
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Table contextual ops ── */}
      {inTable && (
        <>
          <Sep />
          <span className="select-none px-1 text-[10px]" style={{ color: 'var(--ds-outline)' }}>Tabla:</span>
          <TxtBtn label="+Col→"   title="Col. después"  onMouseDown={() => editor.chain().focus().addColumnAfter().run()} />
          <TxtBtn label="+Col←"   title="Col. antes"    onMouseDown={() => editor.chain().focus().addColumnBefore().run()} />
          <TxtBtn label="−Col"    title="Elim. columna" onMouseDown={() => editor.chain().focus().deleteColumn().run()} />
          <TxtBtn label="+Fila↓"  title="Fila abajo"    onMouseDown={() => editor.chain().focus().addRowAfter().run()} />
          <TxtBtn label="+Fila↑"  title="Fila arriba"   onMouseDown={() => editor.chain().focus().addRowBefore().run()} />
          <TxtBtn label="−Fila"   title="Elim. fila"    onMouseDown={() => editor.chain().focus().deleteRow().run()} />
          <TxtBtn label="⊠"       title="Elim. tabla"   onMouseDown={() => editor.chain().focus().deleteTable().run()} />
        </>
      )}

      <Sep />

      {/* ── Shapes ── */}
      <div className="relative">
        <Btn
          icon={Shapes}
          title="Insertar forma"
          active={shapesOpen}
          onMouseDown={(e) => { e.stopPropagation(); setShapesOpen((v) => !v); setTablePickerOpen(false) }}
        />
        {shapesOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShapesOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 flex min-w-[11rem] flex-col gap-0.5 rounded-xl p-1.5"
                 style={{ background: 'var(--ds-surface-lowest)', border: '1px solid rgba(145,180,228,0.3)', boxShadow: 'var(--ds-shadow)' }}>
              {(Object.entries(SHAPE_LABELS) as [ShapeType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onMouseDown={(e) => { e.preventDefault(); insertShape(type) }}
                  className="rounded-lg px-3 py-1.5 text-left text-sm transition"
                  style={{ color: 'var(--ds-on-surface)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--ds-secondary-cnt)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Sep />

      {/* ── Image ── */}
      <Btn icon={Image} title="Insertar imagen" onMouseDown={() => onImageUpload()} />

      <Sep />

      {/* ── History ── */}
      <Btn icon={Undo2} title="Deshacer (Ctrl+Z)" disabled={!editor.can().undo()} onMouseDown={() => editor.chain().focus().undo().run()} />
      <Btn icon={Redo2} title="Rehacer (Ctrl+Y)"  disabled={!editor.can().redo()} onMouseDown={() => editor.chain().focus().redo().run()} />

      <Sep />

      {/* ── Page format ── */}
      <label className="flex items-center gap-1 text-xs" style={{ color: 'var(--ds-on-variant)' }}>
        <span className="select-none text-[11px]">📄</span>
        <select
          value={format}
          onChange={(e) => onFormatChange(e.target.value as FormatKey)}
          className="rounded-lg px-1.5 py-0.5 text-xs outline-none"
          style={{ background: 'var(--ds-surface-lowest)', color: 'var(--ds-on-surface)', border: '1px solid rgba(145,180,228,0.4)' }}
        >
          {(Object.entries(PAGE_FORMATS) as [FormatKey, { label: string }][]).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </label>

      <Sep />

      {/* ── Export ── */}
      <Btn icon={FileDown} title="Descargar como PDF"  onMouseDown={onExportPdf} />
      <Btn icon={FileText} title="Descargar como Word" onMouseDown={onExportWord} />
    </div>
  )
}
