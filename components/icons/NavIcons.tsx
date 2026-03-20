/** Inline SVG icon components — navigation & UI (no lucide-react) */

interface P {
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}

export function SearchIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/magnifying-glass-tilted-left-svgrepo-com.svg" alt="search" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function PlusIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/nueva_nota.svg" alt="plus" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function ChevronRightIcon({ size = 16, strokeWidth = 2, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         className={className} style={style}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 16, strokeWidth = 2, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         className={className} style={style}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function GridIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/grid-plus-svgrepo-com.svg" alt="grid" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function ListViewIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/grip-apilado.svg" alt="list view" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function XIcon({ size = 16, strokeWidth = 2, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         className={className} style={style}>
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  )
}

export function FolderIcon({ size = 16, strokeWidth = 2, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         className={className} style={style}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function FolderOpenIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/folders.svg" alt="folder open" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function FileTextIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/page-facing-up-svgrepo-com.svg" alt="file text" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function LayoutTemplateIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/grid-plus-svgrepo-com.svg" alt="layout template" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function ZapIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/flash-svgrepo-com.svg" alt="zap" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function MoonIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/dark_luna.svg" alt="moon" width={size} height={size}
         className={className} style={style} />
  )
}

export function LayersIcon({ size = 16, strokeWidth = 2, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         className={className} style={style}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

export function TrashIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/eliminar.svg" alt="trash" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function PencilIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/pen1-svgrepo-com.svg" alt="pencil" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

export function FilePlusIcon({ size = 16, className, style }: P) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/svg/nueva_nota.svg" alt="file plus" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}

/** Stacked grid / list view — from grip-apilado.svg */
export function GripApiladoIcon({ size = 16, strokeWidth = 4, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round"
         className={className} style={style}>
      <path d="M41 4H7C5.34315 4 4 5.34315 4 7V41C4 42.6569 5.34315 44 7 44H41C42.6569 44 44 42.6569 44 41V7C44 5.34315 42.6569 4 41 4Z" />
      <path d="M15 4L15 44" />
      <path d="M4 17.0378L44 17" />
      <path d="M4 30.5187L44 30.481" />
    </svg>
  )
}

/** Magnifying glass — from magnifying-glass-tilted-left-svgrepo-com.svg (colored img) */
export function SearchMagnifyIcon({ size = 16, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <img src="/svg/magnifying-glass-tilted-left-svgrepo-com.svg" alt="" width={size} height={size}
         className={className} style={style} />
  )
}

/** Page / document — from page-facing-up-svgrepo-com.svg (inverted in dark mode via svg-ink) */
export function PageFacingUpIcon({ size = 16, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <img src="/svg/page-facing-up-svgrepo-com.svg" alt="" width={size} height={size}
         className={`svg-ink${className ? ` ${className}` : ''}`} style={style} />
  )
}
