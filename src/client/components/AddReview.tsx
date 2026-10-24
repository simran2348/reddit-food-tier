import { navigateTo, showToast } from '@devvit/web/client';
import { useState, type FormEvent } from 'react';
import type { ImportPostResponse, PlaceLocation } from '../../shared/api';
import { isValidRating } from '../../shared/food';
import { createReview, importPost } from '../lib/api';
import { PlacePicker } from './PlacePicker';
import { RatingPicker } from './Stars';
import { ScreenHeader, Segmented } from './ui';

type Mode = 'new' | 'import';

const MODES: { id: Mode; label: string }[] = [
  { id: 'new', label: 'New review' },
  { id: 'import', label: 'From my post' },
];

const inputClass =
  'w-full rounded-lg border border-line bg-field px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cta';
const labelClass = 'flex flex-col gap-1 text-sm font-semibold text-ink';

/** Paste a link to one of your posts and pull in its title, text and photos. */
const ImportBox = ({
  onImported,
}: {
  onImported: (post: ImportPostResponse) => void;
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    try {
      onImported(await importPost(url.trim()));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't load that post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-ink">Link to your post</span>
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={url}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="https://www.reddit.com/r/…/comments/…"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void load();
            }
          }}
        />
        <button
          type="button"
          onClick={() => void load()}
          disabled={!url.trim() || loading}
          className="shrink-0 rounded-lg bg-cta px-4 text-sm font-bold text-cta-ink cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Import'}
        </button>
      </div>
      <p className="text-xs text-muted">
        We'll copy its title, text and photos. You can edit everything below.
      </p>
    </div>
  );
};

export const AddReview = ({ onPosted }: { onPosted: () => void }) => {
  const [mode, setMode] = useState<Mode>('new');
  const [imported, setImported] = useState<ImportPostResponse | null>(null);
  const [title, setTitle] = useState('');
  const [food, setFood] = useState('');
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState<PlaceLocation | undefined>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState<{ postUrl: string | null }>();

  const canSubmit =
    food.trim() &&
    place.trim() &&
    isValidRating(rating) &&
    (mode === 'new' || imported) &&
    !submitting;

  const reset = () => {
    setImported(null);
    setTitle('');
    setFood('');
    setPlace('');
    setLocation(undefined);
    setRating(0);
    setReview('');
    setPosted(undefined);
  };

  const applyImport = (post: ImportPostResponse) => {
    setImported(post);
    setTitle(post.title);
    // Long posts are trimmed to the review length limit.
    setReview(post.body.slice(0, 2000));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await createReview({
        title,
        food,
        place,
        ...(location ? { location } : {}),
        rating,
        review,
        ...(mode === 'import' && imported
          ? { importedPostId: imported.postId }
          : {}),
      });
      setPosted({ postUrl: res.postUrl });
      showToast('Review saved!');
      onPosted();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  if (posted) {
    const { postUrl } = posted;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-5xl">🎉</p>
        <h1 className="text-xl font-bold text-ink">Review saved</h1>
        <div className="flex gap-2">
          {postUrl && (
            <button
              className="rounded-full bg-cta px-4 py-2 text-sm font-semibold text-cta-ink cursor-pointer"
              onClick={() => navigateTo(postUrl)}
            >
              View post
            </button>
          )}
          <button
            className="rounded-full border border-line bg-soft px-4 py-2 text-sm font-semibold text-soft-ink cursor-pointer"
            onClick={reset}
          >
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Add a review"
        subtitle="Rate a place you've eaten at"
      />
      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        <Segmented
          options={MODES}
          value={mode}
          onChange={(next) => {
            setMode(next);
            if (next === 'new') setImported(null);
          }}
        />

        {mode === 'import' && <ImportBox onImported={applyImport} />}

        {mode === 'import' && imported && imported.images.length > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {imported.images.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-24 w-24 shrink-0 rounded-xl object-cover shadow-sm"
              />
            ))}
          </div>
        )}

        {(mode === 'new' || imported) && (
          <>
            <label className={labelClass}>
              Title
              <input
                className={inputClass}
                value={title}
                maxLength={120}
                placeholder="e.g. Best ramen in town"
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Food
              <input
                className={inputClass}
                value={food}
                maxLength={60}
                placeholder="e.g. Ramen"
                onChange={(e) => setFood(e.target.value)}
              />
            </label>

            <div className={labelClass}>
              Café / restaurant
              <PlacePicker
                name={place}
                location={location}
                inputClass={inputClass}
                onChange={(name, loc) => {
                  setPlace(name);
                  setLocation(loc);
                }}
              />
            </div>

            <div className={labelClass}>
              <span>
                Rating{' '}
                <span className="font-normal text-muted">
                  {rating ? `${rating}/10` : 'out of 10'}
                </span>
              </span>
              <RatingPicker value={rating} onChange={setRating} />
            </div>

            <label className={labelClass}>
              <span>
                Review{' '}
                <span className="font-normal text-muted">(optional)</span>
              </span>
              <textarea
                className={`${inputClass} min-h-28`}
                value={review}
                maxLength={2000}
                placeholder="What made it good (or bad)?"
                onChange={(e) => setReview(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 rounded-full bg-cta px-4 py-3 font-bold text-cta-ink shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? 'Saving…'
                : mode === 'import'
                  ? 'Save review'
                  : 'Post review'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};
