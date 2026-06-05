export default function Badge({ children, tono = 'neutral' }) {
  return <span className={`badge badge--${tono}`}>{children}</span>;
}
