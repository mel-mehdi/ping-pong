import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import ThemeInitializer from './components/ThemeInitializer';
import './styles/main.css';
import './styles/professional.css';

// Suppress Vite HMR WebSocket warnings and connection errors
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('WebSocket') || 
      message.includes('websocket') || 
      message.includes('ws://') ||
      message.includes('[vite] server connection lost')) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('WebSocket') || 
      message.includes('websocket') || 
      message.includes('ws://')) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeInitializer />
      <App />
    </LanguageProvider>
  </StrictMode>
);
