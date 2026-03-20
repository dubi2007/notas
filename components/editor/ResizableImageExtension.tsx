'use client'

import { useRef, useCallback } from 'react'
import Image from '@tiptap/extension-image'
import { mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/core'

type FloatVal = 'left' | 'right' | 'none'
type Handle   = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLES: { id: Handle; style: React.CSSProperties; cursor: string }[] = [
  { id: 'nw', style: { top: -5,  left: -5  },                       cursor: 'nw-resize' },
  { id: 'n',  style: { top: -5,  left: 'calc(50% - 5px)' },         cursor: 'n-resize'  },
  { id: 'ne', style: { top: -5,  right: -5 },                       cursor: 'ne-resize' },
  { id: 'e',  style: { top: 'calc(50% - 5px)', right: -5 },         cursor: 'e-resize'  },
  { id: 'se', style: { bottom: -5, right: -5 },                     cursor: 'se-resize' },
  { id: 's',  style: { bottom: -5, left: 'calc(50% - 5px)' },       cursor: 's-resize'  },
  { id: 'sw', style: { bottom: -5, left: -5 },                      cursor: 'sw-resize' },
  { id: 'w',  style: { top: 'calc(50% - 5px)', left: -5 },          cursor: 'w-resize'  },
]

const MIN = 60

// ── React NodeView ─────────────────────────────────────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const float  = (node.attrs.float ?? 'none') as FloatVal
  const width  = node.attrs.width  as number | null
  const height = node.attrs.height as number | null

  const startResize = useCallback((e: React.MouseEvent, handle: Handle) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const startW = imgRef.current?.offsetWidth  ?? width  ?? 300
    const startH = imgRef.current?.offsetHeight ?? height ?? 200

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      const updates: { width?: number; height?: number } = {}

      if (handle.includes('e')) updates.width  = Math.max(MIN, startW + dx)
      if (handle.includes('w')) updates.width  = Math.max(MIN, startW - dx)
      if (handle.includes('s')) updates.height = Math.max(MIN, startH + dy)
      if (handle.includes('n')) updates.height = Math.max(MIN, startH - dy)

      updateAttributes(updates)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
  }, [width, height, updateAttributes])

  // ── Wrapper style based on float ────────────────────────────────────────────
  const wrapperStyle: React.CSSProperties = {
    display:    'inline-block',
    position:   'relative',
    lineHeight: 0,
    float:      float !== 'none' ? float : undefined,
    margin:     float === 'left'  ? '4px 16px 8px 0'
              : float === 'right' ? '4px 0 8px 16px'
              : '4px 0',
    maxWidth:   '100%',
    width:      width  ? `${width}px`  : undefined,
    height:     height ? `${height}px` : undefined,
  }

  return (
    <NodeViewWrapper style={wrapperStyle} data-drag-handle>
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt ?? ''}
        title={node.attrs.title ?? undefined}
        draggable={false}
        className="block rounded"
        style={{ width: '100%', height: height ? '100%' : 'auto', display: 'block', objectFit: 'contain' }}
      />

      {selected && (
        <>
          {/* Selection ring */}
          <div className="pointer-events-none absolute inset-0 rounded ring-2 ring-indigo-500" />

          {/* Float controls */}
          <div className="absolute -top-8 left-0 flex items-center gap-0.5 rounded-md border border-zinc-200 bg-white px-1 py-0.5 shadow-md">
            <button
              title="Flotar izquierda"
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ float: 'left' }) }}
              className={`rounded px-1.5 py-0.5 text-xs ${float === 'left' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >◀ Izq</button>
            <button
              title="Sin float (bloque)"
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ float: 'none' }) }}
              className={`rounded px-1.5 py-0.5 text-xs ${float === 'none' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >⬛ Bloque</button>
            <button
              title="Flotar derecha"
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ float: 'right' }) }}
              className={`rounded px-1.5 py-0.5 text-xs ${float === 'right' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >Der ▶</button>
            <span className="mx-0.5 h-3 w-px bg-zinc-200" />
            <span className="text-[10px] text-zinc-400">
              {width ? `${width}px` : 'auto'}{height ? ` × ${height}px` : ''}
            </span>
          </div>

          {/* 8 resize handles */}
          {HANDLES.map(({ id, style, cursor }) => (
            <div
              key={id}
              className="absolute z-20 h-2.5 w-2.5 rounded-sm border border-indigo-500 bg-white shadow-sm"
              style={{ ...style, cursor, position: 'absolute' }}
              onMouseDown={(e) => startResize(e, id)}
            />
          ))}

          {/* Reset size */}
          <button
            onMouseDown={(e) => { e.preventDefault(); updateAttributes({ width: null, height: null }) }}
            className="absolute top-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white hover:bg-red-600"
            title="Restablecer tamaño"
          >✕ auto</button>
        </>
      )}
    </NodeViewWrapper>
  )
}

// ── TipTap extension ───────────────────────────────────────────────────────────
export const ResizableImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: el => {
          const w = el.getAttribute('width') ?? el.style.width?.replace('px', '')
          return w ? parseInt(w, 10) : null
        },
        renderHTML: attrs => attrs.width ? { width: String(attrs.width) } : {},
      },
      height: {
        default: null,
        parseHTML: el => {
          const h = el.getAttribute('height') ?? el.style.height?.replace('px', '')
          return h ? parseInt(h, 10) : null
        },
        renderHTML: attrs => attrs.height ? { height: String(attrs.height) } : {},
      },
      float: {
        default: 'none',
        parseHTML: el => el.getAttribute('data-float') || el.style.float || 'none',
        renderHTML: attrs => {
          const f = attrs.float as FloatVal
          if (!f || f === 'none') return {}
          const margin = f === 'left' ? '4px 16px 8px 0' : '4px 0 8px 16px'
          return {
            'data-float': f,
            style: `float:${f};margin:${margin};max-width:60%;`,
          }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})
