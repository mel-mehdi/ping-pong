import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import ThemeInitializer from './components/ThemeInitializer';
import './styles/main.css';
import './styles/professional.css';

// Optional global console silencing controlled by Vite env var VITE_SILENT_CONSOLE
// Set VITE_SILENT_CONSOLE=1 to disable all console output (useful for clean screenshots/tests)
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SILENT_CONSOLE === '1') {
    ['log', 'info', 'warn', 'error', 'debug'].forEach((m) => {
      // Preserve original in case we need to restore during runtime debugging
      try { console['__' + m] = console[m]; } catch (e) {}
      try { console[m] = () => {}; } catch (e) {}
    });
  }
} catch (e) {
  // ignore if import.meta not available
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeInitializer />
      <App />
    </LanguageProvider>
  </StrictMode>
);
