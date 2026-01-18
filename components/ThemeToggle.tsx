"use client";

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/30"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      ) : (
        <Sun className="h-5 w-5 text-purple-400" />
      )}
    </Button>
  );
}
