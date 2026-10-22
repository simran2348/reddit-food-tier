import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import {
  StrictMode,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import type {
  FoodReview,
  InitResponse,
  TierEntry,
  UserReviewsResponse,
} from '../shared/api';
import { tierFor } from '../shared/food';
import { FoodBackground } from './components/FoodBackground';
import { Stars } from './components/Stars';
import { ThemeToggle } from './components/ThemeToggle';
import { fetchInit, fetchTier, fetchUserReviews } from './lib/api';
import { initTheme } from './lib/theme';

type Tab = 'list' | 'tier';

type View =
  | { name: 'landing' }
  | { name: 'explore' }
  | { name: 'user'; username: string };

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
  <p className="mx-auto my-4 max-w-xs rounded-xl bg-white/80 px-4 py-6 text-center text-sm font-medium text-stone-700 backdrop-blur dark:bg-black/45 dark:text-stone-200">
    {children}
  </p>
);

const FoodList = ({
  reviews,
  emptyMessage = "No reviews yet. Add the first place you've eaten at!",
}: {
  reviews: FoodReview[];
  emptyMessage?: string;
}) => {
  if (reviews.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
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

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Back"
    className="shrink-0 rounded-full p-1.5 text-lg leading-none text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
  >
    ←
  </button>
);

const FALLBACK_AVATAR = '/snoo.png';

const Avatar = ({
  url,
  username,
}: {
  url: string | null;
  username: string | null;
}) => {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={url && !failed ? url : FALLBACK_AVATAR}
      alt={username ? `u/${username}` : 'Snoo'}
      onError={() => setFailed(true)}
      className="h-25 w-auto max-w-full object-contain drop-shadow-lg"
    />
  );
};

const Landing = ({
  data,
  onExplore,
  onLookup,
}: {
  data: InitResponse | null;
  onExplore: () => void;
  onLookup: (username: string) => void;
}) => {
  const [username, setUsername] = useState('');
  const trimmed = username.trim().replace(/^\/?u\//i, '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (trimmed) onLookup(trimmed);
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-6 text-center">
      <ThemeToggle className="absolute top-3 right-3" />
      <p className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-[#d93900] shadow-sm dark:bg-black/40 dark:text-orange-300">
        {data?.subredditName ? `r/${data.subredditName}` : '\u00a0'}
      </p>
      <Avatar url={data?.avatarUrl ?? null} username={data?.username ?? null} />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">
          {data?.username ? `Hey u/${data.username}!` : '🍔 Food Tier'}
        </h1>
        <p className="max-w-xs text-sm font-medium text-stone-800 dark:text-orange-100/90">
          Rate the spots you eat at, build your personal food list, and see
          which places the community ranks top tier for every dish.
        </p>
      </div>
      <div className="flex w-full max-w-xs gap-2">
        <button
          onClick={onExplore}
          className="flex-1 rounded-full bg-[#d93900] px-4 py-2.5 font-bold text-white shadow-md cursor-pointer hover:bg-[#c23300] transition-colors"
        >
          Explore
        </button>
        <button
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'create')}
          className="flex-1 rounded-full bg-white px-4 py-2.5 font-bold text-[#d93900] shadow-md cursor-pointer hover:bg-orange-50 transition-colors dark:bg-gray-900 dark:text-orange-300 dark:hover:bg-gray-800"
        >
          + Add review
        </button>
      </div>
      <form onSubmit={submit} className="flex w-full max-w-xs gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a username"
          aria-label="Username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={30}
          className="min-w-0 flex-1 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-[#d93900] dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={!trimmed}
          className="shrink-0 rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white shadow-sm cursor-pointer hover:bg-stone-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:bg-orange-300 dark:text-stone-900 dark:hover:bg-orange-200"
        >
          View list
        </button>
      </form>
    </div>
  );
};

const UserList = ({
  username,
  onBack,
}: {
  username: string;
  onBack: () => void;
}) => {
  const [result, setResult] = useState<
    { for: string } & (
      { ok: true; data: UserReviewsResponse } | { ok: false; error: string }
    )
  >();

  useEffect(() => {
    let cancelled = false;
    fetchUserReviews(username)
      .then(
        (data) => !cancelled && setResult({ for: username, ok: true, data })
      )
      .catch((err: Error) => {
        if (!cancelled)
          setResult({ for: username, ok: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const current = result?.for === username ? result : undefined;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-white/50 bg-white/75 backdrop-blur dark:border-white/10 dark:bg-black/45">
        <BackButton onClick={onBack} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-gray-900 dark:text-white">
            u/{current?.ok ? current.data.username : username}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Food list</p>
        </div>
        <ThemeToggle className="ml-auto" />
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-3">
        {!current ? (
          <EmptyState>Loading…</EmptyState>
        ) : !current.ok ? (
          <EmptyState>Couldn't load: {current.error}</EmptyState>
        ) : (
          <FoodList
            reviews={current.data.reviews}
            emptyMessage={`u/${current.data.username} hasn't reviewed any food yet.`}
          />
        )}
      </main>
    </div>
  );
};

export const Splash = () => {
  const [view, setView] = useState<View>({ name: 'landing' });
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

  const goHome = () => setView({ name: 'landing' });

  if (view.name === 'landing') {
    return (
      <Landing
        data={data}
        onExplore={() => setView({ name: 'explore' })}
        onLookup={(username) => setView({ name: 'user', username })}
      />
    );
  }

  if (view.name === 'user') {
    return <UserList username={view.username} onBack={goHome} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="bg-white/75 backdrop-blur dark:bg-black/45">
        <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
          <BackButton onClick={goHome} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              🍔 Food Tier
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {data?.username
                ? `u/${data.username}`
                : 'Rate the spots you love'}
            </p>
          </div>
          <ThemeToggle />
          <button
            className="shrink-0 rounded-full bg-[#d93900] px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-[#c23300] transition-colors"
            onClick={(e) => requestExpandedMode(e.nativeEvent, 'create')}
          >
            + Add review
          </button>
        </header>

        <nav className="flex gap-1 px-4 border-b border-white/50 dark:border-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-[#d93900] text-[#d93900]'
                  : 'border-transparent text-stone-600 dark:text-stone-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-3">
        {error ? (
          <EmptyState>Couldn't load: {error}</EmptyState>
        ) : !data ? (
          <EmptyState>Loading…</EmptyState>
        ) : tab === 'list' ? (
          <FoodList reviews={data.myList} />
        ) : (
          <FoodTier foods={data.foods} />
        )}
      </main>
    </div>
  );
};

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FoodBackground />
    <Splash />
  </StrictMode>
);
