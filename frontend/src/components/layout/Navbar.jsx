import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import Badge from '../ui/Badge.jsx';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    logout();
    navigate('/login');
  };

  const inicio = usuario?.rol === 'admin' ? '/admin' : '/estudiante';

  return (
    <header className="navbar">
      <Link to={usuario ? inicio : '/'} className="navbar__brand">
        🎓 ingles<span>UCR</span>
      </Link>
      {usuario && (
        <div className="navbar__right">
          <Badge tono={usuario.rol === 'admin' ? 'accent' : 'primary'}>
            {usuario.rol}
          </Badge>
          <span className="navbar__user">
            {usuario.first_name || usuario.email}
          </span>
          <button className="navbar__logout" onClick={salir}>
            Salir
          </button>
        </div>
      )}
    </header>
  );
}
