import { useEffect, useState } from 'react';
import {
  listarLecciones,
  obtenerLeccion,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion,
} from '../../api/lecciones.js';
import { listarConceptos } from '../../api/conceptos.js';
import { unwrapLista, mensajeError } from '../../api/helpers.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const NIVELES = ['A1', 'A2', 'B1', 'B2'];
const VACIO = { titulo: '', descripcion: '', nivel: 'A1', orden: 0, publicada: false };

export default function LeccionesCRUD() {
  const toast = useToast();
  const [lecciones, setLecciones] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [seleccion, setSeleccion] = useState([]); // ids ordenados
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await listarLecciones();
      setLecciones(unwrapLista(data));
    } catch (e) {
      toast.error(mensajeError(e, 'No se pudieron cargar las lecciones.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirNuevo = async () => {
    setEditando(null);
    setForm(VACIO);
    setSeleccion([]);
    await cargarConceptos();
    setModal(true);
  };

  const cargarConceptos = async () => {
    try {
      const { data } = await listarConceptos();
      setConceptos(unwrapLista(data));
    } catch (e) {
      toast.error(mensajeError(e));
    }
  };

  const abrirEdicion = async (l) => {
    await cargarConceptos();
    try {
      const { data } = await obtenerLeccion(l.id);
      setEditando(data);
      setForm({
        titulo: data.titulo,
        descripcion: data.descripcion || '',
        nivel: data.nivel,
        orden: data.orden,
        publicada: data.publicada,
      });
      setSeleccion(data.conceptos.map((x) => x.concepto.id));
      setModal(true);
    } catch (e) {
      toast.error(mensajeError(e));
    }
  };

  const alternarConcepto = (id) => {
    setSeleccion((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const payload = {
      ...form,
      orden: Number(form.orden) || 0,
      concepto_ids: seleccion,
    };
    try {
      if (editando) {
        await actualizarLeccion(editando.id, payload);
        toast.exito('Lección actualizada.');
      } else {
        await crearLeccion(payload);
        toast.exito('Lección creada.');
      }
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(mensajeError(err, 'No se pudo guardar la lección.'));
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (l) => {
    if (!window.confirm(`¿Eliminar la lección "${l.titulo}"?`)) return;
    try {
      await eliminarLeccion(l.id);
      toast.exito('Lección eliminada.');
      setLecciones((ls) => ls.filter((x) => x.id !== l.id));
    } catch (e) {
      toast.error(mensajeError(e, 'No se pudo eliminar.'));
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Lecciones</h1>
          <p className="muted">Agrupan conceptos con un orden didáctico.</p>
        </div>
        <Button onClick={abrirNuevo}>+ Nueva lección</Button>
      </div>

      {cargando ? (
        <Spinner />
      ) : lecciones.length === 0 ? (
        <EmptyState icono="📚" titulo="Sin lecciones todavía">
          Crea la primera lección para organizar tus conceptos.
        </EmptyState>
      ) : (
        <div className="list">
          {lecciones.map((l) => (
            <Card key={l.id} className="row">
              <div className="row__main">
                <div className="row__title">
                  <Badge tono="primary">{l.nivel}</Badge>
                  <strong>{l.titulo}</strong>
                  <Badge tono={l.publicada ? 'exito' : 'neutral'}>
                    {l.publicada ? 'Publicada' : 'Borrador'}
                  </Badge>
                </div>
                {l.descripcion && <p className="muted">{l.descripcion}</p>}
              </div>
              <div className="row__actions">
                <Button variant="ghost" onClick={() => abrirEdicion(l)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => borrar(l)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        abierto={modal}
        onCerrar={() => setModal(false)}
        titulo={editando ? 'Editar lección' : 'Nueva lección'}
        ancho={640}
      >
        <form onSubmit={guardar}>
          <Field
            label="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
          <Field
            label="Descripción"
            as="textarea"
            rows={2}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <div className="form-grid">
            <Field
              label="Nivel"
              as="select"
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
            >
              {NIVELES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Field>
            <Field
              label="Orden"
              type="number"
              min="0"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: e.target.value })}
            />
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={form.publicada}
              onChange={(e) => setForm({ ...form, publicada: e.target.checked })}
            />
            Publicada (visible para estudiantes)
          </label>

          <fieldset className="concepto-picker">
            <legend>
              Conceptos ({seleccion.length} seleccionados, en orden)
            </legend>
            {conceptos.length === 0 ? (
              <p className="muted">Primero crea conceptos.</p>
            ) : (
              <div className="picker-list">
                {conceptos.map((c) => {
                  const idx = seleccion.indexOf(c.id);
                  return (
                    <label key={c.id} className="picker-item">
                      <input
                        type="checkbox"
                        checked={idx !== -1}
                        onChange={() => alternarConcepto(c.id)}
                      />
                      {idx !== -1 && <span className="picker-order">{idx + 1}</span>}
                      {c.palabra_ingles}
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          <div className="form-actions">
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
