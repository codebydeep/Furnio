interface FloatingLabelProps {
  name: string
  color: string
  style?: React.CSSProperties
}

export default function FloatingLabel({ name, color, style }: FloatingLabelProps) {
  return (
    <div className="floating-label" style={style}>
      <span className="floating-dot" style={{ background: color }} />
      <span>{name}</span>
    </div>
  ) 
}
