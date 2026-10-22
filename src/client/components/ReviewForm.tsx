import { navigateTo, showToast } from '@devvit/web/client';
import { useState, type FormEvent } from 'react';
import { isValidRating } from '../../shared/food';
import { createReview } from '../lib/api';
import { Stars } from './Stars';
import { BackButton, ScreenHeader } from './ui';

const inputClass =
  'w-full rounded-lg border border-line bg-field px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cta';

/** Full-screen "Add a review" form. `onClose(true)` means a review was posted. */
export const ReviewForm = ({
  onClose,
}: {
  onClose: (posted: boolean) => void;
}) => {
  const [food, setFood] = useState('');
  const [place, setPlace] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState<{ postUrl: string | null }>();

  const canSubmit =
    food.trim() && place.trim() && isValidRating(rating) && !submitting;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await createReview({ food, place, rating, review });
      setPosted({ postUrl: res.postUrl });
      showToast('Review posted!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (posted) {
    const { postUrl } = posted;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-4xl">🎉</p>
        <h1 className="text-xl font-bold text-ink">Review posted</h1>
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
            onClick={() => onClose(true)}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Add a review"
        left={<BackButton onClick={() => onClose(false)} />}
      />
      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Food
          <input
            className={inputClass}
            value={food}
            maxLength={60}
            placeholder="e.g. Pizza"
            onChange={(e) => setFood(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Place
          <input
            className={inputClass}
            value={place}
            maxLength={80}
            placeholder="e.g. Joe's Pizza, NYC"
            onChange={(e) => setPlace(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium text-ink">
          Rating
          <Stars rating={rating} onChange={setRating} size="lg" />
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Review <span className="font-normal text-muted">(optional)</span>
          <textarea
            className={`${inputClass} min-h-24`}
            value={review}
            maxLength={500}
            placeholder="What made it good (or bad)?"
            onChange={(e) => setReview(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 rounded-full bg-cta px-4 py-2.5 font-semibold text-cta-ink cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting…' : 'Post review'}
        </button>
      </form>
    </div>
  );
};
