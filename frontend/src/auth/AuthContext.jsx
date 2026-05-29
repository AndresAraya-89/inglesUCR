import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, perfil } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('access')) {
      perfil()
        .then((r) => setUsuario(r.data))
        .catch(() => localStorage.clear())
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    const me = await perfil();
    setUsuario(me.data);
    return me.data;
  };

  const logout = () => {
    localStorage.clear();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
