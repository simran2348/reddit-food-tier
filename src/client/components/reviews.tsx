import { useEffect, useState } from 'react';
import type { FoodReview, TierEntry } from '../../shared/api';
import { tierFor } from '../../shared/food';
import { fetchTier } from '../lib/api';
import { TIER_COLORS } from '../lib/tiers';
import { Stars } from './Stars';
import { EmptyState } from './ui';

const CARD = 'rounded-xl border border-line bg-surface backdrop-blur';

export const FoodList = ({
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
        <li key={r.id} className={`${CARD} p-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{r.place}</p>
              <p className="text-xs text-muted">{r.food}</p>
            </div>
            <Stars rating={r.rating} />
          </div>
          {r.review && (
            <p className="mt-2 line-clamp-3 text-sm text-ink/80">{r.review}</p>
          )}
        </li>
      ))}
    </ul>
  );
};

export const FoodTier = ({ foods }: { foods: string[] }) => {
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
                ? 'bg-cta text-cta-ink'
                : 'border border-line bg-surface text-ink'
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
                className={`flex items-center gap-3 ${CARD} p-2`}
              >
                <span className="w-5 text-right text-sm font-semibold text-muted">
                  {i + 1}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded font-bold text-white ${TIER_COLORS[tier]}`}
                >
                  {tier}
                </span>
                <span className="flex-1 truncate font-medium text-ink">
                  {e.place}
                </span>
                <span className="text-xs text-muted">
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
