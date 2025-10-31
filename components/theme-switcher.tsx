'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const themes = [
  { id: 'light', name: 'Light', preview: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', preview: 'linear-gradient(135deg, #1e1e2e 0%, #cba6f7 100%)' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', preview: 'linear-gradient(135deg, #282828 0%, #fabd2f 100%)' },
  { id: 'nord', name: 'Nord', preview: 'linear-gradient(135deg, #2e3440 0%, #88c0d0 100%)' },
  { id: 'rose-pine-moon', name: 'Rosé Pine Moon', preview: 'linear-gradient(135deg, #232136 0%, #ea9a97 100%)' },
  { id: 'tokyo-night-storm', name: 'Tokyo Night Storm', preview: 'linear-gradient(135deg, #1a1b26 0%, #7aa2f7 100%)' },
  { id: 'dracula', name: 'Dracula', preview: 'linear-gradient(135deg, #282a36 0%, #bd93f9 100%)' },
  { id: 'one-dark', name: 'One Dark', preview: 'linear-gradient(135deg, #282c34 0%, #61afef 100%)' },
  { id: 'everforest-dark', name: 'Everforest Dark', preview: 'linear-gradient(135deg, #2d353b 0%, #a7c080 100%)' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after hydration to prevent hydration mismatch
  // This is the standard pattern recommended by next-themes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 animate-pulse rounded bg-foreground/5" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`
              relative group rounded-lg p-4 text-left transition-all duration-200
              ${theme === t.id
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'hover:ring-2 hover:ring-muted ring-offset-2 ring-offset-background'
              }
            `}
          >
            {/* Theme Preview */}
            <div
              className="h-16 rounded-md mb-3 shadow-sm"
              style={{ background: t.preview }}
            />

            {/* Theme Name */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t.name}
              </span>
              {theme === t.id && (
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Current Theme Display */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="glass-subtle rounded-lg px-4 py-2 flex-1">
            <span className="text-xs text-muted-foreground">Current Theme:</span>
            <p className="text-sm font-medium text-foreground mt-1">
              {themes.find(t => t.id === theme)?.name || 'Light'}
            </p>
          </div>
          <div className="glass-subtle rounded-lg px-4 py-2 flex-1">
            <span className="text-xs text-muted-foreground">Style:</span>
            <p className="text-sm font-medium text-foreground mt-1">
              Glassmorphism
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}