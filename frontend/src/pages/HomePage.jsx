import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Button from '../components/ui/Button.jsx';

export default function HomePage() {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (usuario) {
    return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/estudiante'} replace />;
  }

  return (
    <>
      <Navbar />
      <main className="hero">
        <div className="hero__content">
          <h1>
            Aprende inglés, <span>impulsa tu futuro</span>
          </h1>
          <p>
            Plataforma interactiva de la UCR para dominar el inglés técnico y
            cotidiano: imagen, fonética y audio en cada concepto, con quizzes de
            retroalimentación inmediata.
          </p>
          <div className="hero__actions">
            <Link to="/login">
              <Button>Iniciar sesión</Button>
            </Link>
            <Link to="/registro">
              <Button variant="secondary">Crear cuenta</Button>
            </Link>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          🎧📘🎓
        </div>
      </main>
    </>
  );
}
