import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../back-office/src/App.jsx';
import { ToastProvider } from './context/ToastContext';
import { initTheme } from './hooks/useTheme';
import '../back-office/src/App.css';


initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
