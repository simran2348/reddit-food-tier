import { useTheme } from '../lib/theme';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const label =
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-orange-200 bg-white/80 text-lg shadow-sm backdrop-blur cursor-pointer hover:bg-white transition-colors dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-800 ${className}`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};
