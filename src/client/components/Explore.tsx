import { useEffect, useState, type FormEvent } from 'react';
import type { UserReviewsResponse } from '../../shared/api';
import { fetchUserReviews } from '../lib/api';
import { FoodList } from './reviews';
import { EmptyState, ScreenHeader } from './ui';

type Result =
  { ok: true; data: UserReviewsResponse } | { ok: false; error: string };

const UserReviews = ({ username }: { username: string }) => {
  const [result, setResult] = useState<{ for: string } & Result>();

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
  if (!current) return <EmptyState>Loading…</EmptyState>;
  if (!current.ok)
    return <EmptyState>Couldn't load: {current.error}</EmptyState>;

  const { data } = current;
  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-sm font-bold text-ink">
        u/{data.username}
        <span className="font-medium text-muted">
          {' '}
          · {data.reviews.length}{' '}
          {data.reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </p>
      <FoodList
        reviews={data.reviews}
        emptyMessage={`u/${data.username} hasn't reviewed any food yet.`}
      />
    </div>
  );
};

export const Explore = () => {
  const [input, setInput] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const trimmed = input.trim().replace(/^\/?u\//i, '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (trimmed) setUsername(trimmed);
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Explore" subtitle="See what others are eating" />
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a username"
            aria-label="Username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={30}
            className="min-w-0 flex-1 rounded-full border border-line bg-field px-4 py-2 text-sm text-ink shadow-sm outline-none placeholder:text-muted focus:border-cta"
          />
          <button
            type="submit"
            disabled={!trimmed}
            className="shrink-0 rounded-full bg-cta px-4 py-2 text-sm font-bold text-cta-ink shadow-sm cursor-pointer hover:brightness-95 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            View list
          </button>
        </form>
        {username ? (
          <UserReviews username={username} />
        ) : (
          <EmptyState>
            Search for a Redditor to see the places they've rated.
          </EmptyState>
        )}
      </main>
    </div>
  );
};
