/**
 * Feedback sonoro inmediato para los quizzes (RF-20).
 * Usa la Web Audio API para no depender de archivos externos: un tono
 * ascendente para acierto y uno grave para error.
 */
let ctx;

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) ctx = new AudioCtx();
  }
  return ctx;
}

function tono(frecuencia, duracion, tipo = 'sine', cuando = 0) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  gain.gain.setValueAtTime(0.0001, audio.currentTime + cuando);
  gain.gain.exponentialRampToValueAtTime(0.2, audio.currentTime + cuando + 0.02);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audio.currentTime + cuando + duracion
  );
  osc.connect(gain).connect(audio.destination);
  osc.start(audio.currentTime + cuando);
  osc.stop(audio.currentTime + cuando + duracion);
}

export function sonidoAcierto() {
  tono(660, 0.15, 'sine', 0);
  tono(880, 0.2, 'sine', 0.12);
}

export function sonidoError() {
  tono(220, 0.3, 'square', 0);
}
