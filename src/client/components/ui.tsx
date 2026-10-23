import { useState, type ReactNode } from 'react';
import { FALLBACK_AVATAR_URL } from '../lib/art';

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="mx-auto my-4 max-w-xs rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm font-medium text-muted backdrop-blur">
    {children}
  </p>
);

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Back"
    className="shrink-0 rounded-full p-1.5 text-lg leading-none text-ink cursor-pointer hover:bg-soft transition-colors"
  >
    ←
  </button>
);

/** Top bar of an app screen. */
export const ScreenHeader = ({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) => (
  <header className="flex items-center gap-2 border-b border-line bg-surface px-4 pt-4 pb-3 backdrop-blur">
    {left}
    <div className="min-w-0 flex-1">
      <h1 className="truncate text-xl font-extrabold text-ink">{title}</h1>
      {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
    </div>
    {right}
  </header>
);

/** Two or more mutually exclusive options shown as a pill switch. */
export const Segmented = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className="flex rounded-full border border-line bg-surface p-1 backdrop-blur">
    {options.map((option) => (
      <button
        key={option.id}
        onClick={() => onChange(option.id)}
        aria-pressed={option.id === value}
        className={`flex-1 rounded-full px-3 py-1.5 text-sm font-bold cursor-pointer transition-colors ${
          option.id === value ? 'bg-cta text-cta-ink shadow-sm' : 'text-muted'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const Avatar = ({
  url,
  username,
  className = '',
}: {
  url: string | null;
  username: string | null;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={url && !failed ? url : FALLBACK_AVATAR_URL}
      alt={username ? `u/${username}` : 'Snoo'}
      onError={() => setFailed(true)}
      className={`w-auto max-w-full object-contain drop-shadow-lg ${className}`}
    />
  );
};
