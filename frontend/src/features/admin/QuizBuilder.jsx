import { useEffect, useState } from 'react';
import { listarLecciones } from '../../api/lecciones.js';
import {
  listarQuizes,
  crearQuiz,
  eliminarQuiz,
} from '../../api/evaluaciones.js';
import { unwrapLista, mensajeError } from '../../api/helpers.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const TIPOS = [
  { value: 'multiple_choice', label: 'Opción múltiple' },
  { value: 'listening', label: 'Listening' },
  { value: 'matching', label: 'Emparejamiento' },
  { value: 'fill_blank', label: 'Completar' },
];

const nuevaPregunta = () => ({
  enunciado: '',
  tipo: 'multiple_choice',
  opciones: [
    { texto: '', es_correcta: true },
    { texto: '', es_correcta: false },
  ],
  respuesta: '', // solo para fill_blank
});

export default function QuizBuilder() {
  const toast = useToast();
  const [lecciones, setLecciones] = useState([]);
  const [leccionId, setLeccionId] = useState('');
  const [quizesExistentes, setQuizes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState([nuevaPregunta()]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listarLecciones();
        setLecciones(unwrapLista(data));
      } catch (e) {
        toast.error(mensajeError(e));
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!leccionId) {
      setQuizes([]);
      return;
    }
    listarQuizes({ leccion: leccionId })
      .then(({ data }) => setQuizes(unwrapLista(data)))
      .catch((e) => toast.error(mensajeError(e)));
  }, [leccionId]);

  // --- edición de preguntas ---
  const setPregunta = (i, cambios) =>
    setPreguntas((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...cambios } : p)));

  const setOpcion = (pi, oi, cambios) =>
    setPreguntas((ps) =>
      ps.map((p, idx) =>
        idx === pi
          ? {
              ...p,
              opciones: p.opciones.map((o, j) =>
                j === oi ? { ...o, ...cambios } : o
              ),
            }
          : p
      )
    );

  const marcarCorrecta = (pi, oi) =>
    setPreguntas((ps) =>
      ps.map((p, idx) =>
        idx === pi
          ? { ...p, opciones: p.opciones.map((o, j) => ({ ...o, es_correcta: j === oi })) }
          : p
      )
    );

  const agregarOpcion = (pi) =>
    setPregunta(pi, {
      opciones: [...preguntas[pi].opciones, { texto: '', es_correcta: false }],
    });

  const quitarOpcion = (pi, oi) => {
    const ops = preguntas[pi].opciones.filter((_, j) => j !== oi);
    if (!ops.some((o) => o.es_correcta) && ops[0]) ops[0].es_correcta = true;
    setPregunta(pi, { opciones: ops });
  };

  const construirPayload = () => ({
    leccion: Number(leccionId),
    titulo,
    descripcion,
    preguntas: preguntas.map((p, orden) => {
      if (p.tipo === 'fill_blank') {
        return {
          enunciado: p.enunciado,
          tipo: p.tipo,
          orden,
          opciones: [{ texto: p.respuesta, es_correcta: true }],
        };
      }
      return {
        enunciado: p.enunciado,
        tipo: p.tipo,
        orden,
        opciones: p.opciones.map((o) => ({
          texto: o.texto,
          es_correcta: o.es_correcta,
        })),
      };
    }),
  });

  const guardar = async (e) => {
    e.preventDefault();
    if (!leccionId) return toast.error('Selecciona una lección.');
    setGuardando(true);
    try {
      await crearQuiz(construirPayload());
      toast.exito('Quiz creado correctamente.');
      setTitulo('');
      setDescripcion('');
      setPreguntas([nuevaPregunta()]);
      const { data } = await listarQuizes({ leccion: leccionId });
      setQuizes(unwrapLista(data));
    } catch (err) {
      toast.error(mensajeError(err, 'No se pudo crear el quiz. Revisa las opciones.'));
    } finally {
      setGuardando(false);
    }
  };

  const borrarQuiz = async (q) => {
    if (!window.confirm(`¿Eliminar el quiz "${q.titulo}"?`)) return;
    try {
      await eliminarQuiz(q.id);
      setQuizes((qs) => qs.filter((x) => x.id !== q.id));
      toast.exito('Quiz eliminado.');
    } catch (e) {
      toast.error(mensajeError(e));
    }
  };

  if (cargando) return <Spinner />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Constructor de quizzes</h1>
          <p className="muted">Cada pregunta vale 1 punto; la nota es la sumatoria.</p>
        </div>
      </div>

      {lecciones.length === 0 ? (
        <EmptyState icono="📝" titulo="Necesitas una lección primero">
          Crea una lección antes de construir su quiz.
        </EmptyState>
      ) : (
        <>
          <Field
            label="Lección"
            as="select"
            value={leccionId}
            onChange={(e) => setLeccionId(e.target.value)}
          >
            <option value="">— Selecciona una lección —</option>
            {lecciones.map((l) => (
              <option key={l.id} value={l.id}>
                [{l.nivel}] {l.titulo}
              </option>
            ))}
          </Field>

          {quizesExistentes.length > 0 && (
            <Card className="quiz-existentes">
              <h4>Quizzes de esta lección</h4>
              {quizesExistentes.map((q) => (
                <div key={q.id} className="row__title">
                  <strong>{q.titulo}</strong>
                  <span className="muted">{q.preguntas?.length ?? 0} preguntas</span>
                  <Button variant="danger" onClick={() => borrarQuiz(q)}>
                    Eliminar
                  </Button>
                </div>
              ))}
            </Card>
          )}

          {leccionId && (
            <form onSubmit={guardar} className="quiz-form">
              <Field
                label="Título del quiz"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
              <Field
                label="Descripción"
                as="textarea"
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />

              {preguntas.map((p, pi) => (
                <Card key={pi} className="pregunta-editor">
                  <div className="pregunta-editor__head">
                    <strong>Pregunta {pi + 1}</strong>
                    {preguntas.length > 1 && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setPreguntas((ps) => ps.filter((_, j) => j !== pi))
                        }
                      >
                        Quitar
                      </Button>
                    )}
                  </div>
                  <Field
                    label="Enunciado"
                    value={p.enunciado}
                    onChange={(e) => setPregunta(pi, { enunciado: e.target.value })}
                    required
                  />
                  <Field
                    label="Tipo"
                    as="select"
                    value={p.tipo}
                    onChange={(e) => setPregunta(pi, { tipo: e.target.value })}
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Field>

                  {p.tipo === 'fill_blank' ? (
                    <Field
                      label="Respuesta correcta"
                      value={p.respuesta}
                      onChange={(e) => setPregunta(pi, { respuesta: e.target.value })}
                      required
                    />
                  ) : (
                    <div className="opciones-editor">
                      <span className="field-label">
                        Opciones (marca la correcta)
                      </span>
                      {p.opciones.map((o, oi) => (
                        <div key={oi} className="opcion-row">
                          <input
                            type="radio"
                            name={`correcta-${pi}`}
                            checked={o.es_correcta}
                            onChange={() => marcarCorrecta(pi, oi)}
                            aria-label="Marcar como correcta"
                          />
                          <input
                            className="opcion-texto"
                            value={o.texto}
                            placeholder={`Opción ${oi + 1}`}
                            onChange={(e) =>
                              setOpcion(pi, oi, { texto: e.target.value })
                            }
                            required
                          />
                          {p.opciones.length > 2 && (
                            <button
                              type="button"
                              className="opcion-quitar"
                              onClick={() => quitarOpcion(pi, oi)}
                              aria-label="Quitar opción"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <Button variant="ghost" onClick={() => agregarOpcion(pi)}>
                        + Opción
                      </Button>
                    </div>
                  )}
                </Card>
              ))}

              <div className="form-actions form-actions--split">
                <Button
                  variant="secondary"
                  onClick={() => setPreguntas((ps) => [...ps, nuevaPregunta()])}
                >
                  + Agregar pregunta
                </Button>
                <Button type="submit" disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Crear quiz'}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
