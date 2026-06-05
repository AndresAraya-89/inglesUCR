import { NavLink } from 'react-router-dom';
import Navbar from './Navbar.jsx';

/**
 * Estructura de página con navegación lateral.
 * `nav`: [{ to, label, icon }]
 */
export default function AppShell({ nav = [], children }) {
  return (
    <div className="shell">
      <Navbar />
      <div className="shell__body">
        {nav.length > 0 && (
          <aside className="sidebar">
            <nav>
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                  }
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}
        <main className="shell__content">{children}</main>
      </div>
    </div>
  );
}
