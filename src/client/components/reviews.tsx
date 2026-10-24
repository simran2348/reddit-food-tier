import { useEffect, useState } from 'react';
import type { FoodReview, TierEntry } from '../../shared/api';
import { tierFor } from '../../shared/food';
import { fetchTier } from '../lib/api';
import { TIER_COLORS } from '../lib/tiers';
import { ReviewDetail } from './ReviewDetail';
import { Stars } from './Stars';
import { EmptyState, LoadingState } from './ui';

const CARD = 'rounded-xl border border-line bg-surface backdrop-blur';

export const FoodList = ({
  reviews,
  emptyMessage = "No reviews yet. Add the first place you've eaten at!",
}: {
  reviews: FoodReview[];
  emptyMessage?: string;
}) => {
  const [open, setOpen] = useState<FoodReview | null>(null);

  if (reviews.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }
  return (
    <>
      <ul className="flex flex-col gap-2">
        {reviews.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => setOpen(r)}
              className={`flex w-full gap-3 ${CARD} p-3 text-left cursor-pointer hover:bg-soft transition-colors`}
            >
              {r.images[0] && (
                <img
                  src={r.images[0]}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{r.place}</p>
                    <p className="truncate text-xs text-muted">
                      {r.title || r.food}
                    </p>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                {r.review && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink/80">
                    {r.review}
                  </p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
      {open && <ReviewDetail review={open} onClose={() => setOpen(null)} />}
    </>
  );
};

/** Ranked places per food category; "All" (the default) combines them. */
export const FoodTier = ({ foods }: { foods: string[] }) => {
  // null = "All".
  const [food, setFood] = useState<string | null>(null);
  const [tier, setTier] = useState<{ food: string; entries: TierEntry[] }>();
  const loading = tier?.food !== (food ?? '');
  const entries = tier?.entries ?? [];

  useEffect(() => {
    let cancelled = false;
    fetchTier(food)
      .then((res) => !cancelled && setTier(res))
      .catch((err) => {
        console.error('Failed to load tier', err);
        if (!cancelled) setTier({ food: food ?? '', entries: [] });
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
        <button
          onClick={() => setFood(null)}
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold cursor-pointer transition-colors ${
            food === null
              ? 'bg-cta text-cta-ink'
              : 'border border-line bg-surface text-ink'
          }`}
        >
          All
        </button>
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
        <LoadingState />
      ) : entries.length === 0 ? (
        <EmptyState>
          {food ? `No places ranked for ${food} yet.` : 'No places ranked yet.'}
        </EmptyState>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {entries.map((e, i) => {
            const tier = tierFor(e.average);
            return (
              <li
                key={`${e.food ?? ''}-${e.place}`}
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
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">
                    {e.place}
                  </span>
                  {e.food && (
                    <span className="block truncate text-xs text-muted">
                      {e.food}
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted">
                  {e.average.toFixed(1)}/10 · {e.count}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
