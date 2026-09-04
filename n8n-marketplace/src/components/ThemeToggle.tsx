"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, mounted, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className={`p-2 rounded-lg  text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors ${className}`}
    >
      {mounted && theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
