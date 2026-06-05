import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import CatalogoLecciones from '../features/estudiante/CatalogoLecciones.jsx';
import VistaLeccion from '../features/estudiante/VistaLeccion.jsx';
import QuizPlayer from '../features/estudiante/QuizPlayer.jsx';
import HistorialIntentos from '../features/estudiante/HistorialIntentos.jsx';

const NAV = [
  { to: '/estudiante', label: 'Catálogo', icon: '🏠', end: true },
  { to: '/estudiante/historial', label: 'Mi historial', icon: '📊' },
];

export default function EstudianteDashboard() {
  return (
    <AppShell nav={NAV}>
      <Routes>
        <Route index element={<CatalogoLecciones />} />
        <Route path="lecciones/:id" element={<VistaLeccion />} />
        <Route path="lecciones/:id/quiz" element={<QuizPlayer />} />
        <Route path="historial" element={<HistorialIntentos />} />
        <Route path="*" element={<Navigate to="/estudiante" replace />} />
      </Routes>
    </AppShell>
  );
}
