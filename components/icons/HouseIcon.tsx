export function HouseIcon({
  size = 16,
  className,
  style,
}: {
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/svg/house_documentos.svg"
      alt="home"
      width={size}
      height={size}
      className={`svg-ink${className ? ` ${className}` : ''}`}
      style={style}
    />
  )
}
