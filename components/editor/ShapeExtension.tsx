'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import type { NodeView as PMNodeView } from 'prosemirror-view'
import type { Node as PMNode } from 'prosemirror-model'

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'diamond'

export const SHAPE_LABELS: Record<ShapeType, string> = {
  rectangle: '▬ Rectángulo',
  circle:    '○ Círculo',
  triangle:  '△ Triángulo',
  arrow:     '→ Flecha',
  diamond:   '◇ Rombo',
}

const NS = 'http://www.w3.org/2000/svg'
const S = 2 // stroke width

function buildSVGPath(shapeType: ShapeType, w: number, h: number): SVGElement {
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('width', String(w))
  svg.setAttribute('height', String(h))
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.style.display = 'block'
  svg.style.overflow = 'visible'

  let shape: SVGElement

  switch (shapeType) {
    case 'rectangle': {
      shape = document.createElementNS(NS, 'rect')
      shape.setAttribute('x', String(S / 2))
      shape.setAttribute('y', String(S / 2))
      shape.setAttribute('width', String(w - S))
      shape.setAttribute('height', String(h - S))
      shape.setAttribute('rx', '6')
      break
    }
    case 'circle': {
      shape = document.createElementNS(NS, 'ellipse')
      shape.setAttribute('cx', String(w / 2))
      shape.setAttribute('cy', String(h / 2))
      shape.setAttribute('rx', String(w / 2 - S))
      shape.setAttribute('ry', String(h / 2 - S))
      break
    }
    case 'triangle': {
      shape = document.createElementNS(NS, 'polygon')
      shape.setAttribute('points', `${w / 2},${S} ${w - S},${h - S} ${S},${h - S}`)
      shape.setAttribute('stroke-linejoin', 'round')
      break
    }
    case 'arrow': {
      const mid = h / 2
      const tail = h * 0.3
      const tip = w - S
      const neck = w * 0.62
      shape = document.createElementNS(NS, 'path')
      shape.setAttribute('d',
        `M${S},${mid - tail / 2} L${neck},${mid - tail / 2} L${neck},${S} L${tip},${mid} L${neck},${h - S} L${neck},${mid + tail / 2} L${S},${mid + tail / 2} Z`
      )
      shape.setAttribute('stroke-linejoin', 'round')
      break
    }
    case 'diamond': {
      shape = document.createElementNS(NS, 'polygon')
      shape.setAttribute('points', `${w / 2},${S} ${w - S},${h / 2} ${w / 2},${h - S} ${S},${h / 2}`)
      break
    }
    default: {
      shape = document.createElementNS(NS, 'rect')
      shape.setAttribute('x', String(S / 2))
      shape.setAttribute('y', String(S / 2))
      shape.setAttribute('width', String(w - S))
      shape.setAttribute('height', String(h - S))
    }
  }

  shape.setAttribute('stroke-width', String(S))
  svg.appendChild(shape)
  return svg
}

function applyColors(svg: SVGElement, fill: string, stroke: string) {
  const shape = svg.firstElementChild as SVGElement | null
  if (!shape) return
  shape.setAttribute('fill', fill)
  shape.setAttribute('stroke', stroke)
}

// ── DOM-based NodeView (no React portals) ─────────────────────────────────────
class ShapeNodeView implements PMNodeView {
  dom: HTMLElement
  private svg: SVGElement
  private controls: HTMLElement
  private updateFn: (attrs: Record<string, unknown>) => void

  constructor(
    private node: PMNode,
    private getPos: () => number | undefined,
    updateAttributes: (attrs: Record<string, unknown>) => void,
  ) {
    this.updateFn = updateAttributes
    const { shapeType, width: w, height: h, fill, stroke } = node.attrs as {
      shapeType: ShapeType; width: number; height: number; fill: string; stroke: string
    }

    // Wrapper
    this.dom = document.createElement('div')
    this.dom.setAttribute('data-shape-figure', 'true')
    this.dom.style.cssText = 'display:block; margin:12px 0; user-select:none; width:fit-content;'

    // SVG
    this.svg = buildSVGPath(shapeType, w, h)
    applyColors(this.svg, fill, stroke)
    this.dom.appendChild(this.svg)

    // Controls toolbar (hidden by default, shown on click)
    this.controls = document.createElement('div')
    this.controls.style.cssText =
      'display:none; margin-top:6px; padding:6px 10px; border:1px solid #e4e4e7; border-radius:6px; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.08); font-size:11px; color:#71717a; align-items:center; gap:12px; flex-wrap:wrap;'
    this.dom.appendChild(this.controls)

    this.buildControls(fill, stroke, w, h)

    // Toggle controls on click
    this.dom.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = this.controls.style.display === 'flex'
      this.controls.style.display = isOpen ? 'none' : 'flex'
    })
    // Close when clicking outside
    document.addEventListener('click', this.onOutsideClick)
  }

  private onOutsideClick = () => {
    this.controls.style.display = 'none'
  }

  private buildControls(fill: string, stroke: string, w: number, h: number) {
    this.controls.innerHTML = ''

    // Fill color
    const fillLabel = this.makeColorInput('Relleno', fill, (v) => {
      this.updateFn({ fill: v })
    })
    // Stroke color
    const strokeLabel = this.makeColorInput('Borde', stroke, (v) => {
      this.updateFn({ stroke: v })
    })
    // Size
    const sizeSpan = document.createElement('span')
    sizeSpan.textContent = `${w} × ${h} px`
    sizeSpan.style.cssText = 'color:#a1a1aa; font-size:10px;'

    // Resize handle
    const resizeBtn = document.createElement('div')
    resizeBtn.textContent = '⤡ Redimensionar'
    resizeBtn.style.cssText =
      'cursor:se-resize; padding:2px 8px; border-radius:4px; background:#f4f4f5; font-size:11px; user-select:none;'
    resizeBtn.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      const startW = w
      const startH = h
      const onMove = (ev: MouseEvent) => {
        this.updateFn({
          width: Math.max(40, Math.round(startW + ev.clientX - startX)),
          height: Math.max(40, Math.round(startH + ev.clientY - startY)),
        })
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    })

    this.controls.appendChild(fillLabel)
    this.controls.appendChild(strokeLabel)
    this.controls.appendChild(sizeSpan)
    this.controls.appendChild(resizeBtn)
  }

  private makeColorInput(label: string, value: string, onChange: (v: string) => void): HTMLLabelElement {
    const lbl = document.createElement('label')
    lbl.style.cssText = 'display:flex; align-items:center; gap:4px; cursor:pointer;'
    const span = document.createElement('span')
    span.textContent = label
    const input = document.createElement('input')
    input.type = 'color'
    input.value = value
    input.style.cssText = 'width:20px; height:20px; border:none; padding:0; cursor:pointer; border-radius:3px;'
    input.addEventListener('input', (e) => {
      e.stopPropagation()
      onChange((e.target as HTMLInputElement).value)
    })
    lbl.appendChild(span)
    lbl.appendChild(input)
    return lbl
  }

  update(node: PMNode) {
    if (node.type !== this.node.type) return false
    this.node = node
    const { shapeType, width: w, height: h, fill, stroke } = node.attrs as {
      shapeType: ShapeType; width: number; height: number; fill: string; stroke: string
    }
    // Rebuild SVG
    this.dom.removeChild(this.svg)
    this.svg = buildSVGPath(shapeType, w, h)
    applyColors(this.svg, fill, stroke)
    this.dom.insertBefore(this.svg, this.controls)
    // Rebuild controls
    this.buildControls(fill, stroke, w, h)
    return true
  }

  destroy() {
    document.removeEventListener('click', this.onOutsideClick)
  }

  stopEvent() {
    return true
  }

  ignoreMutation() {
    return true
  }
}

// ── TipTap Node extension ─────────────────────────────────────────────────────
export const ShapeExtension = Node.create({
  name: 'shapeFigure',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      shapeType: { default: 'rectangle' },
      width:  { default: 180, parseHTML: (el) => Number(el.getAttribute('data-w') ?? 180) },
      height: { default: 110, parseHTML: (el) => Number(el.getAttribute('data-h') ?? 110) },
      fill:   { default: '#dbeafe' },
      stroke: { default: '#3b82f6' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-shape-figure]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-shape-figure': 'true',
        'data-w': HTMLAttributes.width,
        'data-h': HTMLAttributes.height,
      }),
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }: { node: PMNode; getPos: (() => number | undefined) | boolean; editor: unknown }) => {
      const updateAttributes = (attrs: Record<string, unknown>) => {
        if (typeof getPos !== 'function') return
        const pos = getPos()
        if (pos === undefined) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(editor as any).view.dispatch(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor as any).view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs })
        )
      }
      return new ShapeNodeView(node, getPos as () => number | undefined, updateAttributes)
    }
  },
})
