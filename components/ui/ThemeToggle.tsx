'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle({ className = 'btn-outline-light' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Načtení výchozího stavu po mountnutí (aby se předešlo hydration errorm)
  useEffect(() => {
    const saved = (localStorage.getItem('olympcms-theme') as 'light' | 'dark') || 'light';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('olympcms-theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
  };

  return (
    <button
      className={`btn ${className}`}
      onClick={toggleTheme}
      title={theme === 'light' ? 'Přepnout na tmavé téma' : 'Přepnout na světlé téma'}
    >
      {theme === 'light' ? 'Tmavý režim' : 'Světlý režim'}
    </button>
  );
}
