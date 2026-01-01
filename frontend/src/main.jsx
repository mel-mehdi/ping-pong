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
const originalLog = console.log;

console.error = (...args) => {
  // Convert all arguments to strings for pattern matching
  const fullMessage = args.map(arg => String(arg)).join(' ');
  
  // Suppress WebSocket errors and auth-related errors (login/register)
  if (fullMessage.includes('WebSocket') || 
      fullMessage.includes('websocket') || 
      fullMessage.includes('ws://') ||
      fullMessage.includes('[vite] server connection lost') ||
      fullMessage.includes('401') ||
      fullMessage.includes('400') ||
      fullMessage.includes('403') ||
      fullMessage.includes('404') ||
      fullMessage.includes('Unauthorized') ||
      fullMessage.includes('Bad Request') ||
      fullMessage.includes('Forbidden') ||
      fullMessage.includes('Not Found') ||
      fullMessage.includes('Cross-Origin-Opener-Policy') ||
      fullMessage.includes('POST http://localhost/auth') ||
      fullMessage.includes('POST http://localhost/users') ||
      (fullMessage.includes('api.js') && (fullMessage.includes('auth') || fullMessage.includes('users') || fullMessage.includes('401') || fullMessage.includes('400') || fullMessage.includes('403') || fullMessage.includes('404'))) ||
      (fullMessage.includes('auth') && (fullMessage.includes('login') || fullMessage.includes('register')))) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const fullMessage = args.map(arg => String(arg)).join(' ');
  if (fullMessage.includes('WebSocket') || 
      fullMessage.includes('websocket') || 
      fullMessage.includes('ws://') ||
      fullMessage.includes('GSI_LOGGER') ||
      fullMessage.includes('Cross-Origin-Opener-Policy') ||
      fullMessage.includes('Authentication credentials') ||
      (fullMessage.includes('API Error') && (fullMessage.includes('login') || fullMessage.includes('register')))) {
    return;
  }
  originalWarn.apply(console, args);
};

console.log = (...args) => {
  const fullMessage = args.map(arg => String(arg)).join(' ');
  // Suppress auth-related network logs
  if ((fullMessage.includes('auth') && (fullMessage.includes('login') || fullMessage.includes('register'))) || 
      fullMessage.includes('401') ||
      fullMessage.includes('400') ||
      fullMessage.includes('403') ||
      fullMessage.includes('404')) {
    return;
  }
  originalLog.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeInitializer />
      <App />
    </LanguageProvider>
  </StrictMode>
);
