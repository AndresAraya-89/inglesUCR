import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { obtenerLeccion } from '../../api/lecciones.js';
import { obtenerQuiz } from '../../api/evaluaciones.js';
import { mensajeError } from '../../api/helpers.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageFrame from '../../components/multimedia/ImageFrame.jsx';
import AudioPlayer from '../../components/multimedia/AudioPlayer.jsx';
import PhoneticText from '../../components/multimedia/PhoneticText.jsx';

export default function VistaLeccion() {
  const { id } = useParams();
  const toast = useToast();
  const [leccion, setLeccion] = useState(null);
  const [hayQuiz, setHayQuiz] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await obtenerLeccion(id);
        setLeccion(data);
        try {
          await obtenerQuiz(id);
          setHayQuiz(true);
        } catch {
          setHayQuiz(false);
        }
      } catch (e) {
        toast.error(mensajeError(e));
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  if (cargando) return <Spinner />;
  if (!leccion) return null;

  return (
    <section>
      <Link to="/estudiante" className="back-link">
        ← Volver al catálogo
      </Link>

      <div className="page-head">
        <div>
          <div className="row__title">
            <Badge tono="primary">{leccion.nivel}</Badge>
            <h1>{leccion.titulo}</h1>
          </div>
          {leccion.descripcion && <p className="muted">{leccion.descripcion}</p>}
        </div>
        {hayQuiz && (
          <Link to={`/estudiante/lecciones/${id}/quiz`}>
            <Button>Iniciar quiz →</Button>
          </Link>
        )}
      </div>

      <div className="grid">
        {leccion.conceptos.map(({ concepto }, i) => (
          <motion.div
            key={concepto.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flashcard">
              <ImageFrame src={concepto.imagen} alt={concepto.palabra_ingles} />
              <h3>{concepto.palabra_ingles}</h3>
              <PhoneticText value={concepto.transcripcion_fonetica} />
              <AudioPlayer src={concepto.audio} />
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
