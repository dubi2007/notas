'use client'

import { HEADER_H, FOOTER_H, PAGE_GAP_PX } from './pageFormats'
import { replaceVars } from './pageStorage'

interface Props {
  index:       number
  pageH:       number
  pageCount:   number
  headerText:  string
  footerText:  string
  onEditHeader: () => void
  onEditFooter: () => void
}

export function PageCard({ index, pageH, pageCount, headerText, footerText, onEditHeader, onEditFooter }: Props) {
  return (
    <div
      className="absolute left-0 right-0"
      style={{
        top:       index * (pageH + PAGE_GAP_PX),
        height:    pageH,
        background: 'var(--page-bg)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header zone */}
      <div
        className="absolute left-0 right-0 top-0 flex cursor-text items-center justify-center px-8"
        style={{ height: HEADER_H, zIndex: 20, background: 'var(--page-bg)', borderBottom: '1px solid var(--page-border)' }}
        onDoubleClick={(e) => { e.stopPropagation(); onEditHeader() }}
      >
        <span className="select-none text-[11px]" style={{ color: 'var(--page-text-muted)' }}>
          {headerText
            ? replaceVars(headerText, index + 1, pageCount)
            : (index === 0 ? 'Doble clic para agregar encabezado' : '')}
        </span>
      </div>

      {/* Footer zone */}
      <div
        className="absolute bottom-0 left-0 right-0 flex cursor-text items-center justify-between px-8"
        style={{ height: FOOTER_H, zIndex: 20, background: 'var(--page-bg)', borderTop: '1px solid var(--page-border)' }}
        onDoubleClick={(e) => { e.stopPropagation(); onEditFooter() }}
      >
        <span className="select-none text-[11px]" style={{ color: 'var(--page-text-muted)' }}>
          {footerText
            ? replaceVars(footerText, index + 1, pageCount)
            : (index === 0 ? 'Doble clic para agregar pie de página' : '')}
        </span>
        <span className="select-none text-[11px]" style={{ color: 'var(--page-text-subtle)' }}>
          {index + 1} / {pageCount}
        </span>
      </div>
    </div>
  )
}
