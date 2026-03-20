interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

/** dark_luna.svg — rendered as img (preserves original moon colors) */
export function LunaIcon({ size = 16, className, style }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/svg/dark_luna.svg"
      alt="luna"
      width={size}
      height={size}
      className={className}
      style={style}
    />
  )
}
