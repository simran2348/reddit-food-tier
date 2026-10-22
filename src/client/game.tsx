import './index.css';

import {
  StrictMode,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import type { InitResponse } from '../shared/api';
import { Explore } from './components/Explore';
import { FoodBackground } from './components/FoodBackground';
import { CogIcon, ListIcon, SearchIcon } from './components/icons';
import { MyFood } from './components/MyFood';
import { ReviewForm } from './components/ReviewForm';
import { Settings } from './components/Settings';
import { fetchInit } from './lib/api';
import { initTheme, syncTheme } from './lib/theme';

type Tab = 'food' | 'explore' | 'settings';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'food', label: 'My Food', icon: <ListIcon className="h-6 w-6" /> },
  { id: 'explore', label: 'Explore', icon: <SearchIcon className="h-6 w-6" /> },
  { id: 'settings', label: 'Settings', icon: <CogIcon className="h-6 w-6" /> },
];

const BottomNav = ({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) => (
  <nav className="flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] backdrop-blur">
    {TABS.map((t) => {
      const active = t.id === tab;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          aria-current={active ? 'page' : undefined}
          className={`flex flex-1 flex-col items-center gap-0.5 pt-2 pb-2.5 text-[11px] font-bold cursor-pointer transition-colors ${
            active ? 'text-cta' : 'text-muted hover:text-ink'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      );
    })}
  </nav>
);

export const App = () => {
  const [tab, setTab] = useState<Tab>('food');
  const [adding, setAdding] = useState(false);
  const [data, setData] = useState<InitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const themeSynced = useRef(false);

  const load = useCallback(() => {
    fetchInit()
      .then((res) => {
        setData(res);
        setError(null);
        // Adopt the account's saved theme once; later refreshes could race
        // with a theme the user is picking right now.
        if (!themeSynced.current) {
          themeSynced.current = true;
          syncTheme(res.theme);
        }
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  if (adding) {
    return (
      <ReviewForm
        onClose={(posted) => {
          setAdding(false);
          if (posted) load();
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {tab === 'food' ? (
          <MyFood data={data} error={error} onAdd={() => setAdding(true)} />
        ) : tab === 'explore' ? (
          <Explore />
        ) : (
          <Settings subredditName={data?.subredditName ?? ''} />
        )}
      </div>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
};

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FoodBackground />
    <App />
  </StrictMode>
);
