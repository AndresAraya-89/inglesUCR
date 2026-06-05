import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registro } from '../../api/auth.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { mensajeError } from '../../api/helpers.js';
import { useToast } from '../../components/ui/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Field from '../../components/ui/Field.jsx';
import Button from '../../components/ui/Button.jsx';

export default function RegistroPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await registro(form);
      await login(form.email, form.password);
      toast.exito('¡Cuenta creada! Bienvenido.');
      navigate('/estudiante');
    } catch (err) {
      setError(mensajeError(err, 'No se pudo crear la cuenta.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <h1>Crear cuenta</h1>
        <p className="muted">Regístrate como estudiante.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label="Nombre" value={form.first_name} onChange={set('first_name')} required />
            <Field label="Apellidos" value={form.last_name} onChange={set('last_name')} required />
          </div>
          <Field label="Usuario" value={form.username} onChange={set('username')} required />
          <Field
            label="Correo"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="correo@ucr.ac.cr"
            required
          />
          <Field
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={set('password')}
            hint="Mínimo 8 caracteres."
            minLength={8}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" full disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear cuenta'}
          </Button>
        </form>
        <p className="auth-alt">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </Card>
    </main>
  );
}
