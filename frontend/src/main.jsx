import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import ThemeInitializer from './components/ThemeInitializer';
import './styles/main.css';
import './styles/professional.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeInitializer />
      <App />
    </LanguageProvider>
  </StrictMode>
);
