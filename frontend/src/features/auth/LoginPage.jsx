import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { mensajeError } from '../../api/helpers.js';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Button from '../../components/ui/Button.jsx';

export default function LoginPage() {
  const { login, usuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/estudiante'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const me = await login(email, password);
      navigate(me.rol === 'admin' ? '/admin' : '/estudiante');
    } catch (err) {
      setError(mensajeError(err, 'Credenciales inválidas.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <h1>Iniciar sesión</h1>
        <p className="muted">Bienvenido de nuevo a inglesUCR.</p>
        <form onSubmit={handleSubmit}>
          <Field
            label="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ucr.ac.cr"
            required
          />
          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" full disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <p className="auth-alt">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </Card>
    </main>
  );
}
