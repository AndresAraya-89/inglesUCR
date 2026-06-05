import { useEffect, useState } from 'react';
import { historial } from '../../api/evaluaciones.js';
import { unwrapLista, mensajeError } from '../../api/helpers.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function HistorialIntentos() {
  const toast = useToast();
  const [intentos, setIntentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    historial()
      .then(({ data }) => setIntentos(unwrapLista(data)))
      .catch((e) => toast.error(mensajeError(e)))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Mi historial</h1>
          <p className="muted">Intentos y notas obtenidas.</p>
        </div>
      </div>

      {intentos.length === 0 ? (
        <EmptyState icono="📊" titulo="Todavía no has resuelto ningún quiz">
          Cuando completes un quiz, aparecerá aquí tu resultado.
        </EmptyState>
      ) : (
        <div className="list">
          {intentos.map((it) => (
            <Card key={it.id} className="row">
              <div className="row__main">
                <div className="row__title">
                  <strong>{it.quiz_titulo}</strong>
                  <Badge tono={it.completado ? 'exito' : 'neutral'}>
                    {it.completado ? 'Completado' : 'En curso'}
                  </Badge>
                </div>
                <p className="muted">Iniciado: {fmtFecha(it.fecha_inicio)}</p>
              </div>
              <div className="row__score">
                <span className="score">
                  {it.puntaje_total}
                  <small>/ {it.total_preguntas}</small>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
