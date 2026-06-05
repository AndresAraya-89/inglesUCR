/**
 * Imagen optimizada con carga diferida y texto alternativo (RNF-20).
 * `alt` es obligatorio para accesibilidad.
 */
export default function ImageFrame({ src, alt, ratio = '4 / 3' }) {
  return (
    <div className="image-frame" style={{ aspectRatio: ratio }}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="image-frame__placeholder" aria-hidden="true">
          🖼️
        </div>
      )}
    </div>
  );
}
