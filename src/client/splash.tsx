import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import {
  StrictMode,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import type { FoodReview, InitResponse, TierEntry } from '../shared/api';
import { tierFor } from '../shared/food';
import { Stars } from './components/Stars';
import { fetchInit, fetchTier } from './lib/api';

type Tab = 'list' | 'tier';

const TABS: { id: Tab; label: string }[] = [
  { id: 'list', label: 'My Food List' },
  { id: 'tier', label: 'Food Tier' },
];

const TIER_COLORS: Record<string, string> = {
  S: 'bg-rose-500',
  A: 'bg-orange-500',
  B: 'bg-amber-500',
  C: 'bg-lime-600',
  D: 'bg-sky-600',
};

const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
    {children}
  </p>
);

const MyFoodList = ({ reviews }: { reviews: FoodReview[] }) => {
  if (reviews.length === 0) {
    return (
      <EmptyState>
        No reviews yet. Add the first place you've eaten at!
      </EmptyState>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {r.place}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {r.food}
              </p>
            </div>
            <Stars rating={r.rating} />
          </div>
          {r.review && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {r.review}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};

const FoodTier = ({ foods }: { foods: string[] }) => {
  const [picked, setFood] = useState<string | null>(null);
  const food = picked ?? foods[0] ?? null;
  const [tier, setTier] = useState<{ food: string; entries: TierEntry[] }>();
  const loading = food !== null && tier?.food !== food;
  const entries = tier?.entries ?? [];

  useEffect(() => {
    if (!food) return;
    let cancelled = false;
    fetchTier(food)
      .then((res) => !cancelled && setTier(res))
      .catch((err) => {
        console.error('Failed to load tier', err);
        if (!cancelled) setTier({ food, entries: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [food]);

  if (foods.length === 0) {
    return (
      <EmptyState>No foods rated yet. Be the first to start a tier!</EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {foods.map((f) => (
          <button
            key={f}
            onClick={() => setFood(f)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm cursor-pointer transition-colors ${
              f === food
                ? 'bg-[#d93900] text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : entries.length === 0 ? (
        <EmptyState>No places ranked for {food} yet.</EmptyState>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {entries.map((e, i) => {
            const tier = tierFor(e.average);
            return (
              <li
                key={e.place}
                className="flex items-center gap-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2"
              >
                <span className="w-5 text-right text-sm font-semibold text-gray-500">
                  {i + 1}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded font-bold text-white ${TIER_COLORS[tier]}`}
                >
                  {tier}
                </span>
                <span className="flex-1 truncate font-medium text-gray-900 dark:text-gray-100">
                  {e.place}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {e.average.toFixed(1)}★ · {e.count}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export const Splash = () => {
  const [tab, setTab] = useState<Tab>('list');
  const [data, setData] = useState<InitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchInit()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
    // Refresh when the user comes back from the expanded create view.
    const onVisible = () => document.visibilityState === 'visible' && load();
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            🍔 Food Tier
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {data?.username ? `u/${data.username}` : 'Rate the spots you love'}
          </p>
        </div>
        <button
          className="shrink-0 rounded-full bg-[#d93900] px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-[#c23300] transition-colors"
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'create')}
        >
          + Add review
        </button>
      </header>

      <nav className="flex gap-1 px-4 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[#d93900] text-[#d93900]'
                : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto px-4 py-3">
        {error ? (
          <EmptyState>Couldn't load: {error}</EmptyState>
        ) : !data ? (
          <EmptyState>Loading…</EmptyState>
        ) : tab === 'list' ? (
          <MyFoodList reviews={data.myList} />
        ) : (
          <FoodTier foods={data.foods} />
        )}
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
