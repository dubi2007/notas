import type { FormatKey } from '@/components/editor/TipTapEditor'

// These must match constants in TipTapEditor.tsx
const HEADER_H = 28  // px
const FOOTER_H = 28  // px

// Page info per format — must match PAGE_FORMATS / PAGE_HEIGHT_PX in TipTapEditor
const FORMAT_INFO: Record<string, {
  width: string; height: string; padV: string; padH: string; widthPx: number
}> = {
  a4:    { width: '210mm',   height: '297mm',   padV: '20mm', padH: '25mm', widthPx: Math.round(210   * 96 / 25.4) },
  carta: { width: '215.9mm', height: '279.4mm', padV: '20mm', padH: '25mm', widthPx: Math.round(215.9 * 96 / 25.4) },
  a5:    { width: '148mm',   height: '210mm',   padV: '15mm', padH: '18mm', widthPx: Math.round(148   * 96 / 25.4) },
  legal: { width: '215.9mm', height: '355.6mm', padV: '20mm', padH: '25mm', widthPx: Math.round(215.9 * 96 / 25.4) },
  libre: { width: 'auto',    height: 'auto',    padV: '2rem', padH: '3rem', widthPx: 600 },
}

function esc(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function exportPdf(
  title: string,
  htmlContent: string,
  format: FormatKey,
) {
  const info    = FORMAT_INFO[format] ?? FORMAT_INFO.a4
  const isLibre = format === 'libre'
  const pageSize = isLibre ? 'auto' : `${info.width} ${info.height}`

  // Content padding mirrors the editor's contentWrapRef exactly:
  //   top    = HEADER_H + fmt vertical padding
  //   bottom = FOOTER_H + fmt vertical padding
  //   sides  = fmt horizontal padding
  const contentPadding = `
    padding-top: calc(${HEADER_H}px + ${info.padV});
    padding-bottom: calc(${FOOTER_H}px + ${info.padV});
    padding-left: ${info.padH};
    padding-right: ${info.padH};
  `

  const doc = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    @page {
      size: ${pageSize};
      margin: 0;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      line-height: 1.65;
      color: #111;
      background: white;
    }

    .page-wrap {
      width: ${isLibre ? '100%' : info.width};
      min-height: ${isLibre ? 'auto' : info.height};
      background: white;
    }

    .page-content {
      ${contentPadding}
    }

    /* Inline images with float (inserted via TipTap) */
    img[data-float="left"]  { float: left;  margin: 4px 16px 8px 0; max-width: 60%; height: auto; }
    img[data-float="right"] { float: right; margin: 4px 0 8px 16px; max-width: 60%; height: auto; }
    img:not([data-float])   { display: block; max-width: 100%; height: auto; margin: 8px 0; }
    /* After floated images — clear the float */
    p + p, h1 + p, h2 + p, h3 + p, table, hr, ul, ol, blockquote { clear: none; }

    /* highlight marks */
    mark { border-radius: 2px; padding: 0 1px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* TipTap node styles */
    h1.doc-title { font-size: 26px; font-weight: 700; margin-bottom: 18px; }
    h1 { font-size: 22px; font-weight: 700; margin: 16px 0 8px; }
    h2 { font-size: 18px; font-weight: 700; margin: 14px 0 6px; }
    h3 { font-size: 15px; font-weight: 700; margin: 12px 0 4px; }
    p  { margin-bottom: 10px; }
    ul, ol { margin: 0 0 10px 1.5em; }
    li { margin-bottom: 4px; }
    blockquote {
      border-left: 3px solid #ccc;
      padding-left: 12px;
      color: #555;
      font-style: italic;
      margin: 10px 0;
    }
    pre {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 10px 14px;
      font-size: 12px;
      margin-bottom: 10px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-size: 12px; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
    th, td { border: 1px solid #bbb; padding: 6px 10px; font-size: 12px; }
    th { background: #f5f5f5; font-weight: 700; }
    img { max-width: 100%; height: auto; }
    hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
    s  { text-decoration: line-through; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="page-content">
      ${title ? `<h1 class="doc-title">${esc(title)}</h1>` : ''}
      ${htmlContent}
      <div style="clear:both;"></div>
    </div>
  </div>
  <script>
    window.addEventListener('load', function () { window.print(); });
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) { alert('Permite ventanas emergentes para exportar a PDF.'); return }
  win.document.write(doc)
  win.document.close()
}
