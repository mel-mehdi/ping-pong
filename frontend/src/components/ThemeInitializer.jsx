import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
    } catch {}
  }, []);
  return null;
}
