import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure any previous dark mode artifacts are fully cleared
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
  document.documentElement.removeAttribute('data-bs-theme');
  try {
    localStorage.removeItem('tschuess_theme');
  } catch {
    // Ignore storage access error
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
