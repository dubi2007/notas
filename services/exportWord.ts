function esc(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(str: string) {
  return str.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || 'nota'
}

export function exportWord(
  title: string,
  htmlContent: string,
) {
  const doc = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${esc(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page WordSection1 {
      size: 21cm 29.7cm;
      margin: 2cm 2.5cm;
      mso-header-margin: 1cm;
      mso-footer-margin: 1cm;
      mso-paper-source: 0;
    }
    body {
      font-family: Calibri, Arial, sans-serif;
      font-size: 11pt;
      color: #111;
      line-height: 1.5;
      mso-style-parent: '';
      margin: 0;
    }
    div.WordSection1 { page: WordSection1; }

    h1.doc-title { font-size: 24pt; font-weight: bold; margin-bottom: 14pt; color: #111; }
    h1 { font-size: 18pt; font-weight: bold; margin: 12pt 0 6pt; }
    h2 { font-size: 14pt; font-weight: bold; margin: 10pt 0 5pt; }
    h3 { font-size: 12pt; font-weight: bold; margin: 8pt 0 4pt; }
    p  { margin: 0 0 8pt; }
    ul, ol { margin: 0 0 8pt 18pt; }
    li { margin-bottom: 3pt; }
    blockquote {
      border-left: 3pt solid #ccc;
      padding-left: 10pt;
      color: #555;
      font-style: italic;
      margin: 8pt 0;
    }
    pre, code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      background: #f5f5f5;
    }
    pre {
      border: 1pt solid #ddd;
      padding: 8pt;
      margin-bottom: 8pt;
      white-space: pre-wrap;
      word-break: break-all;
    }
    code { padding: 1pt 3pt; }
    pre code { background: none; padding: 0; }
    mark { border-radius: 2px; padding: 0 1px; }
    img[data-float="left"]  { float: left;  margin: 4pt 12pt 6pt 0; max-width: 50%; }
    img[data-float="right"] { float: right; margin: 4pt 0 6pt 12pt; max-width: 50%; }
    img:not([data-float])   { display: block; max-width: 100%; margin: 6pt 0; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 8pt; }
    th, td { border: 1pt solid #bbb; padding: 4pt 8pt; font-size: 10pt; }
    th { background: #f5f5f5; font-weight: bold; }
    img { max-width: 100%; }
    hr { border: none; border-top: 1pt solid #ddd; margin: 12pt 0; }
    s  { text-decoration: line-through; }
  </style>
</head>
<body>
  <div class="WordSection1">
    ${title ? `<h1 class="doc-title">${esc(title)}</h1>` : ''}
    ${htmlContent}
  </div>
</body>
</html>`

  const blob = new Blob(['\ufeff', doc], {
    type: 'application/vnd.ms-word;charset=utf-8',
  })

  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = `${slugify(title)}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
