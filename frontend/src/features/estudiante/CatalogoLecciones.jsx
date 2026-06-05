import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarLecciones } from '../../api/lecciones.js';
import { unwrapLista, mensajeError } from '../../api/helpers.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function CatalogoLecciones() {
  const toast = useToast();
  const [lecciones, setLecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarLecciones()
      .then(({ data }) => setLecciones(unwrapLista(data)))
      .catch((e) => toast.error(mensajeError(e)))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Mis lecciones</h1>
          <p className="muted">Elige una lección para aprender y practicar.</p>
        </div>
      </div>

      {lecciones.length === 0 ? (
        <EmptyState icono="🌱" titulo="Aún no hay lecciones publicadas">
          Vuelve pronto: tu profesor está preparando el contenido.
        </EmptyState>
      ) : (
        <div className="grid">
          {lecciones.map((l) => (
            <Link key={l.id} to={`/estudiante/lecciones/${l.id}`} className="plain-link">
              <Card hover className="leccion-card">
                <Badge tono="primary">{l.nivel}</Badge>
                <h3>{l.titulo}</h3>
                {l.descripcion && <p className="muted">{l.descripcion}</p>}
                <span className="leccion-card__cta">Entrar →</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
