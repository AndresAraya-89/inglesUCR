import { useEffect, useState } from 'react';
import {
  listarConceptos,
  crearConcepto,
  actualizarConcepto,
  eliminarConcepto,
} from '../../api/conceptos.js';
import { unwrapLista, mensajeError } from '../../api/helpers.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ImageFrame from '../../components/multimedia/ImageFrame.jsx';
import AudioPlayer from '../../components/multimedia/AudioPlayer.jsx';
import PhoneticText from '../../components/multimedia/PhoneticText.jsx';

const VACIO = {
  palabra_ingles: '',
  transcripcion_fonetica: '',
  categoria: '',
  imagen: null,
  audio: null,
};

export default function ConceptosCRUD() {
  const toast = useToast();
  const [conceptos, setConceptos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = async (search = '') => {
    setCargando(true);
    try {
      const { data } = await listarConceptos(search ? { search } : undefined);
      setConceptos(unwrapLista(data));
    } catch (e) {
      toast.error(mensajeError(e, 'No se pudieron cargar los conceptos.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const buscar = (e) => {
    e.preventDefault();
    cargar(busqueda);
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(VACIO);
    setModal(true);
  };

  const abrirEdicion = (c) => {
    setEditando(c);
    setForm({
      palabra_ingles: c.palabra_ingles,
      transcripcion_fonetica: c.transcripcion_fonetica,
      categoria: c.categoria || '',
      imagen: null,
      audio: null,
    });
    setModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const fd = new FormData();
    fd.append('palabra_ingles', form.palabra_ingles);
    fd.append('transcripcion_fonetica', form.transcripcion_fonetica);
    fd.append('categoria', form.categoria);
    if (form.imagen) fd.append('imagen', form.imagen);
    if (form.audio) fd.append('audio', form.audio);
    try {
      if (editando) {
        await actualizarConcepto(editando.id, fd);
        toast.exito('Concepto actualizado.');
      } else {
        await crearConcepto(fd);
        toast.exito('Concepto creado.');
      }
      setModal(false);
      cargar(busqueda);
    } catch (err) {
      toast.error(mensajeError(err, 'No se pudo guardar el concepto.'));
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (c) => {
    if (!window.confirm(`¿Eliminar "${c.palabra_ingles}"?`)) return;
    try {
      await eliminarConcepto(c.id);
      toast.exito('Concepto eliminado.');
      setConceptos((cs) => cs.filter((x) => x.id !== c.id));
    } catch (e) {
      toast.error(mensajeError(e, 'No se pudo eliminar.'));
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Conceptos</h1>
          <p className="muted">Unidad atómica: palabra, fonética, imagen y audio.</p>
        </div>
        <Button onClick={abrirNuevo}>+ Nuevo concepto</Button>
      </div>

      <form className="toolbar" onSubmit={buscar}>
        <input
          placeholder="Buscar por palabra o categoría…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Button variant="secondary" type="submit">
          Buscar
        </Button>
      </form>

      {cargando ? (
        <Spinner />
      ) : conceptos.length === 0 ? (
        <EmptyState icono="📘" titulo="Sin conceptos todavía">
          Crea el primero con el botón “Nuevo concepto”.
        </EmptyState>
      ) : (
        <div className="grid">
          {conceptos.map((c) => (
            <Card key={c.id} hover className="concepto-card">
              <ImageFrame src={c.imagen} alt={c.palabra_ingles} />
              <div className="concepto-card__body">
                <h3>{c.palabra_ingles}</h3>
                <PhoneticText value={c.transcripcion_fonetica} />
                {c.categoria && <p className="muted">{c.categoria}</p>}
                <AudioPlayer src={c.audio} />
              </div>
              <div className="concepto-card__actions">
                <Button variant="ghost" onClick={() => abrirEdicion(c)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => borrar(c)}>
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
        titulo={editando ? 'Editar concepto' : 'Nuevo concepto'}
      >
        <form onSubmit={guardar}>
          <Field
            label="Palabra en inglés"
            value={form.palabra_ingles}
            onChange={(e) => setForm({ ...form, palabra_ingles: e.target.value })}
            required
          />
          <Field
            label="Transcripción fonética (IPA)"
            value={form.transcripcion_fonetica}
            onChange={(e) =>
              setForm({ ...form, transcripcion_fonetica: e.target.value })
            }
            placeholder="/həˈloʊ/"
            required
          />
          <Field
            label="Categoría"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            placeholder="Ej. saludos"
          />
          <Field
            label="Imagen"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hint={editando ? 'Déjalo vacío para conservar la actual.' : 'JPG, PNG o WebP (máx. 5 MB).'}
            onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })}
            {...(!editando ? { required: true } : {})}
          />
          <Field
            label="Audio de pronunciación"
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg"
            hint={editando ? 'Déjalo vacío para conservar el actual.' : 'MP3, WAV u OGG (máx. 10 MB).'}
            onChange={(e) => setForm({ ...form, audio: e.target.files[0] })}
            {...(!editando ? { required: true } : {})}
          />
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
