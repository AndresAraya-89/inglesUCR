import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const quitar = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  const mostrar = useCallback(
    (mensaje, tono = 'info') => {
      const id = ++idSeq;
      setToasts((t) => [...t, { id, mensaje, tono }]);
      setTimeout(() => quitar(id), 3500);
    },
    [quitar]
  );

  const toast = {
    exito: (m) => mostrar(m, 'exito'),
    error: (m) => mostrar(m, 'error'),
    info: (m) => mostrar(m, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast--${t.tono}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              onClick={() => quitar(t.id)}
            >
              {t.mensaje}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
