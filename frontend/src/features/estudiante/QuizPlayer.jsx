import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  obtenerQuiz,
  iniciarIntento,
  enviarRespuesta,
  finalizarIntento,
} from '../../api/evaluaciones.js';
import { mensajeError } from '../../api/helpers.js';
import { sonidoAcierto, sonidoError } from '../../utils/feedback.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function QuizPlayer() {
  const { id } = useParams();
  const toast = useToast();
  const [quiz, setQuiz] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState('intro'); // intro | jugando | fin
  const [intento, setIntento] = useState(null);
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState(null); // opcion id
  const [texto, setTexto] = useState('');
  const [feedback, setFeedback] = useState(null); // {es_correcta}
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    obtenerQuiz(id)
      .then(({ data }) => setQuiz(data))
      .catch(() => setQuiz(null))
      .finally(() => setCargando(false));
  }, [id]);

  const comenzar = async () => {
    try {
      const { data } = await iniciarIntento(quiz.id);
      setIntento(data);
      setEstado('jugando');
    } catch (e) {
      toast.error(mensajeError(e, 'No se pudo iniciar el intento.'));
    }
  };

  const pregunta = quiz?.preguntas?.[indice];
  const esFillBlank = pregunta?.tipo === 'fill_blank';
  const puedeResponder = esFillBlank ? texto.trim() !== '' : seleccion !== null;

  const responder = async () => {
    if (!puedeResponder || feedback) return;
    setEnviando(true);
    const payload = esFillBlank
      ? { pregunta: pregunta.id, respuesta_texto: texto }
      : { pregunta: pregunta.id, opcion: seleccion };
    try {
      const { data } = await enviarRespuesta(intento.id, payload);
      setFeedback(data);
      if (data.es_correcta) sonidoAcierto();
      else sonidoError();
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  const siguiente = async () => {
    if (indice + 1 < quiz.preguntas.length) {
      setIndice((i) => i + 1);
      setSeleccion(null);
      setTexto('');
      setFeedback(null);
    } else {
      try {
        const { data } = await finalizarIntento(intento.id);
        setResultado(data);
        setEstado('fin');
      } catch (e) {
        toast.error(mensajeError(e));
      }
    }
  };

  if (cargando) return <Spinner />;

  if (!quiz) {
    return (
      <section>
        <Link to={`/estudiante/lecciones/${id}`} className="back-link">
          ← Volver
        </Link>
        <EmptyState icono="🤔" titulo="Esta lección no tiene quiz">
          Aún no hay un quiz disponible para esta lección.
        </EmptyState>
      </section>
    );
  }

  // --- Pantalla de introducción ---
  if (estado === 'intro') {
    return (
      <section className="quiz-center">
        <Card className="quiz-intro">
          <h1>{quiz.titulo}</h1>
          {quiz.descripcion && <p className="muted">{quiz.descripcion}</p>}
          <p>
            {quiz.total_preguntas} pregunta{quiz.total_preguntas !== 1 && 's'} · 1 punto
            cada una.
          </p>
          <Button onClick={comenzar}>Comenzar</Button>
        </Card>
      </section>
    );
  }

  // --- Pantalla de resultado ---
  if (estado === 'fin') {
    const total = resultado.total_preguntas || quiz.total_preguntas;
    const pct = total ? Math.round((resultado.puntaje_total / total) * 100) : 0;
    return (
      <section className="quiz-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Card className="quiz-resultado">
            <div className="quiz-resultado__emoji">{pct >= 60 ? '🎉' : '💪'}</div>
            <h1>
              {resultado.puntaje_total} / {total}
            </h1>
            <p className="muted">Puntaje obtenido ({pct}%)</p>
            <div className="quiz-resultado__actions">
              <Link to="/estudiante">
                <Button variant="secondary">Volver al catálogo</Button>
              </Link>
              <Link to="/estudiante/historial">
                <Button variant="ghost">Ver mi historial</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>
    );
  }

  // --- Pantalla de juego ---
  const progreso = ((indice + (feedback ? 1 : 0)) / quiz.preguntas.length) * 100;

  return (
    <section className="quiz-center">
      <div className="quiz-play">
        <div className="quiz-progress" aria-hidden="true">
          <motion.span
            className="quiz-progress__bar"
            animate={{ width: `${progreso}%` }}
          />
        </div>
        <p className="quiz-contador">
          Pregunta {indice + 1} de {quiz.preguntas.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={pregunta.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Card className="quiz-pregunta">
              <h2>{pregunta.enunciado}</h2>

              {esFillBlank ? (
                <input
                  className="quiz-input"
                  value={texto}
                  disabled={!!feedback}
                  placeholder="Escribe tu respuesta…"
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && responder()}
                />
              ) : (
                <div className="quiz-opciones">
                  {pregunta.opciones.map((o) => {
                    const elegida = seleccion === o.id;
                    let clase = 'quiz-opcion';
                    if (feedback && elegida)
                      clase += feedback.es_correcta
                        ? ' quiz-opcion--ok'
                        : ' quiz-opcion--mal';
                    else if (elegida) clase += ' quiz-opcion--sel';
                    return (
                      <button
                        key={o.id}
                        type="button"
                        className={clase}
                        disabled={!!feedback}
                        onClick={() => setSeleccion(o.id)}
                      >
                        {o.texto}
                      </button>
                    );
                  })}
                </div>
              )}

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`quiz-feedback ${
                      feedback.es_correcta ? 'quiz-feedback--ok' : 'quiz-feedback--mal'
                    }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {feedback.es_correcta ? '✓ ¡Correcto!' : '✗ Incorrecto'}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="quiz-acciones">
                {!feedback ? (
                  <Button
                    onClick={responder}
                    disabled={!puedeResponder || enviando}
                  >
                    {enviando ? 'Enviando…' : 'Responder'}
                  </Button>
                ) : (
                  <Button onClick={siguiente}>
                    {indice + 1 < quiz.preguntas.length
                      ? 'Siguiente →'
                      : 'Ver resultado'}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
