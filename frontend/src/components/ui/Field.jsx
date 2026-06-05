/** Campo de formulario con etiqueta accesible. Soporta input, textarea y select. */
export default function Field({
  label,
  as = 'input',
  hint,
  children,
  id,
  ...props
}) {
  const inputId = id || `f-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      {as === 'textarea' ? (
        <textarea id={inputId} {...props} />
      ) : as === 'select' ? (
        <select id={inputId} {...props}>
          {children}
        </select>
      ) : (
        <input id={inputId} {...props} />
      )}
      {hint && <small className="field__hint">{hint}</small>}
    </div>
  );
}
