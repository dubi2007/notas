'use client'

import React from 'react'

export interface FIData {
  id: string
  src: string
  x: number   // px from left of pages-container
  y: number   // px from top of pages-container
  w: number
  h: number
}

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLES: { id: Handle; style: React.CSSProperties; cursor: string }[] = [
  { id: 'nw', style: { top: -5, left: -5 },                       cursor: 'nw-resize' },
  { id: 'n',  style: { top: -5, left: 'calc(50% - 5px)' },        cursor: 'n-resize'  },
  { id: 'ne', style: { top: -5, right: -5 },                      cursor: 'ne-resize' },
  { id: 'e',  style: { top: 'calc(50% - 5px)', right: -5 },       cursor: 'e-resize'  },
  { id: 'se', style: { bottom: -5, right: -5 },                   cursor: 'se-resize' },
  { id: 's',  style: { bottom: -5, left: 'calc(50% - 5px)' },     cursor: 's-resize'  },
  { id: 'sw', style: { bottom: -5, left: -5 },                    cursor: 'sw-resize' },
  { id: 'w',  style: { top: 'calc(50% - 5px)', left: -5 },        cursor: 'w-resize'  },
]

const MIN = 40

interface Props {
  img: FIData
  selected: boolean
  onSelect: () => void
  onUpdate: (updated: FIData) => void
  onDelete: () => void
}

export function FloatingImage({ img, selected, onSelect, onUpdate, onDelete }: Props) {
  // ── Drag ─────────────────────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).dataset.handle) return
    e.preventDefault()
    e.stopPropagation()
    onSelect()

    const startX = e.clientX
    const startY = e.clientY
    const origX  = img.x
    const origY  = img.y

    const move = (ev: MouseEvent) =>
      onUpdate({ ...img, x: origX + (ev.clientX - startX), y: origY + (ev.clientY - startY) })

    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  const startResize = (e: React.MouseEvent, handle: Handle) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const { x: ox, y: oy, w: ow, h: oh } = img

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let [nx, ny, nw, nh] = [ox, oy, ow, oh]

      if (handle.includes('e'))  nw = Math.max(MIN, ow + dx)
      if (handle.includes('w')) { nw = Math.max(MIN, ow - dx); nx = ox + ow - nw }
      if (handle.includes('s'))  nh = Math.max(MIN, oh + dy)
      if (handle.includes('n')) { nh = Math.max(MIN, oh - dy); ny = oy + oh - nh }

      onUpdate({ ...img, x: nx, y: ny, w: nw, h: nh })
    }

    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <div
      className={`absolute select-none cursor-move ${
        selected
          ? 'ring-2 ring-indigo-400 ring-offset-1'
          : 'hover:ring-1 hover:ring-indigo-200'
      }`}
      style={{ left: img.x, top: img.y, width: img.w, height: img.h, zIndex: 15 }}
      onMouseDown={startDrag}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
    >
      {/* Image */}
      <img
        src={img.src}
        alt=""
        draggable={false}
        className="pointer-events-none block h-full w-full object-contain"
      />

      {selected && (
        <>
          {/* Delete button */}
          <button
            className="absolute -right-3 -top-3 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow hover:bg-red-600"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            onClick={(e) => { e.stopPropagation(); onDelete() }}
          >
            ✕
          </button>

          {/* Resize handles */}
          {HANDLES.map(({ id, style, cursor }) => (
            <div
              key={id}
              data-handle={id}
              className="absolute z-20 h-2.5 w-2.5 rounded-sm border border-indigo-500 bg-white shadow-sm"
              style={{ ...style, cursor }}
              onMouseDown={(e) => startResize(e, id)}
            />
          ))}
        </>
      )}
    </div>
  )
}
