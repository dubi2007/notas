interface IconProps {
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}

/** sunlight_sol.svg — stroke="currentColor" conversion */
export function SunIcon({ size = 16, className, style }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/svg/sunlight_sol.svg"
      alt="sun"
      width={size}
      height={size}
      className={className}
      style={style}
    />
  )
}
