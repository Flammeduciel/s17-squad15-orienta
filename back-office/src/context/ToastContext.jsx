import { useCallback, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { ToastContext } from './toast-context';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const toast = useCallback((message, bad = false) => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { id, message, bad }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast${t.bad ? ' bad' : ''}`}>
            <Icon name={t.bad ? 'x' : 'check'} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
