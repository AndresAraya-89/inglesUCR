import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>inglesUCR</h1>
      <p>Plataforma de aprendizaje de inglés para estudiantes UCR.</p>
      <Link to="/login">Iniciar sesión</Link>
    </main>
  );
}
