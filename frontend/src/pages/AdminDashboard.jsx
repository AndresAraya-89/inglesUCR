import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ConceptosCRUD from '../features/admin/ConceptosCRUD.jsx';
import LeccionesCRUD from '../features/admin/LeccionesCRUD.jsx';
import QuizBuilder from '../features/admin/QuizBuilder.jsx';

const NAV = [
  { to: '/admin/conceptos', label: 'Conceptos', icon: '📘' },
  { to: '/admin/lecciones', label: 'Lecciones', icon: '📚' },
  { to: '/admin/quizzes', label: 'Quizzes', icon: '📝' },
];

export default function AdminDashboard() {
  return (
    <AppShell nav={NAV}>
      <Routes>
        <Route index element={<Navigate to="conceptos" replace />} />
        <Route path="conceptos" element={<ConceptosCRUD />} />
        <Route path="lecciones" element={<LeccionesCRUD />} />
        <Route path="quizzes" element={<QuizBuilder />} />
        <Route path="*" element={<Navigate to="conceptos" replace />} />
      </Routes>
    </AppShell>
  );
}
