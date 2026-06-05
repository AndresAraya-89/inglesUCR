import { useEffect, useRef, useState } from 'react';

/**
 * Reproductor de pronunciación con control de repetición (RF-18).
 * El estudiante puede reproducir el audio las veces que necesite.
 */
export default function AudioPlayer({ src, etiqueta = 'Pronunciación' }) {
  const audioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return undefined;
    const onEnd = () => setReproduciendo(false);
    a.addEventListener('ended', onEnd);
    return () => a.removeEventListener('ended', onEnd);
  }, []);

  const alternar = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.currentTime = 0;
      a.play();
      setReproduciendo(true);
    } else {
      a.pause();
      setReproduciendo(false);
    }
  };

  if (!src) return null;

  return (
    <div className="audio-player">
      <button
        type="button"
        className="audio-player__btn"
        onClick={alternar}
        aria-label={`${etiqueta}: reproducir`}
      >
        {reproduciendo ? '❚❚' : '►'}
      </button>
      <span className="audio-player__label">{etiqueta}</span>
      <audio ref={audioRef} src={src} preload="none" />
    </div>
  );
}
