'use client';
import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {
      // ignore in non-browser environments
    }
  }, []);

  return null;
}
