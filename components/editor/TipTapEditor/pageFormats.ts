export const PAGE_FORMATS = {
  libre: { label: 'Libre', width: '100%',    minHeight: 'unset',   padding: '2rem 3rem'  },
  a4:    { label: 'A4',    width: '210mm',   minHeight: '297mm',   padding: '20mm 25mm'  },
  carta: { label: 'Carta', width: '215.9mm', minHeight: '279.4mm', padding: '20mm 25mm'  },
  a5:    { label: 'A5',    width: '148mm',   minHeight: '210mm',   padding: '15mm 18mm'  },
  legal: { label: 'Legal', width: '215.9mm', minHeight: '355.6mm', padding: '20mm 25mm'  },
} as const

export type FormatKey = keyof typeof PAGE_FORMATS

export const PAGE_GAP_PX = 8   // gap between page cards
export const HEADER_H    = 28  // px — header overlay height
export const FOOTER_H    = 28  // px — footer overlay height

export const PAGE_HEIGHT_PX: Partial<Record<FormatKey, number>> = {
  a4:    Math.round(297   * 96 / 25.4),
  carta: Math.round(279.4 * 96 / 25.4),
  a5:    Math.round(210   * 96 / 25.4),
  legal: Math.round(355.6 * 96 / 25.4),
}
