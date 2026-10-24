import { navigateTo } from '@devvit/web/client';
import type { FoodReview } from '../../shared/api';
import { MAX_RATING, tierFor } from '../../shared/food';
import { useTheme } from '../lib/theme';
import { TIER_COLORS } from '../lib/tiers';
import { ThemeSurface } from './FoodBackground';
import { BackButton, ScreenHeader } from './ui';

const postLink = (postId: string) =>
  `https://www.reddit.com/comments/${postId.replace(/^t3_/, '')}`;

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** Full-screen view of one review, opened from a list. */
export const ReviewDetail = ({
  review,
  onClose,
}: {
  review: FoodReview;
  onClose: () => void;
}) => {
  const tier = tierFor(review.rating);
  const { postId } = review;

  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-[768px] flex-col">
      <ThemeSurface
        palette={useTheme()}
        withArt={false}
        className="absolute inset-0 -z-10"
      />
      <ScreenHeader
        title={review.title || review.place}
        subtitle={`u/${review.username}`}
        left={<BackButton onClick={onClose} />}
      />
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {review.images.length > 0 && (
          <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4">
            {review.images.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-64 w-[85%] shrink-0 snap-center rounded-2xl object-cover shadow-md"
              />
            ))}
          </div>
        )}

        <section className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 backdrop-blur">
          <div className="text-center">
            <p className="text-4xl font-extrabold leading-none text-ink">
              {review.rating}
              <span className="text-lg font-bold text-muted">
                /{MAX_RATING}
              </span>
            </p>
          </div>
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-extrabold text-white ${TIER_COLORS[tier]}`}
          >
            {tier}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-ink">{review.place}</p>
            <p className="truncate text-sm text-muted">{review.food}</p>
          </div>
        </section>

        {review.location && (
          <p className="flex items-start gap-1.5 px-1 text-sm text-muted">
            <span aria-hidden>📍</span>
            {review.location.address || 'Location saved'}
          </p>
        )}

        {review.review && (
          <p className="whitespace-pre-line rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink/90 backdrop-blur">
            {review.review}
          </p>
        )}

        <p className="px-1 text-xs text-muted">{formatDate(review.postedAt)}</p>

        {postId && (
          <button
            onClick={() => navigateTo(postLink(postId))}
            className="rounded-full border border-line bg-soft px-4 py-2.5 text-sm font-bold text-soft-ink cursor-pointer hover:brightness-95 transition"
          >
            View on Reddit
          </button>
        )}
      </main>
    </div>
  );
};
