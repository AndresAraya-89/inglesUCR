export default function EmptyState({ icono = '📭', titulo, children }) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">
        {icono}
      </div>
      <h3>{titulo}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
