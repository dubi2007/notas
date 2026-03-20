interface IconProps {
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}

/** folder-plus-svgrepo-com.svg — fill="currentColor" conversion */
export function FolderPlusIcon({ size = 16, className, style }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/svg/folder-plus-svgrepo-com.svg"
      alt="folder plus"
      width={size}
      height={size}
      className={`svg-ink${className ? ` ${className}` : ''}`}
      style={style}
    />
  )
}
