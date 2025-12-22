import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';
import './styles/professional.css';
import { LanguageProvider } from './contexts/LanguageContext';
import ThemeInitializer from './components/ThemeInitializer';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeInitializer />
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
