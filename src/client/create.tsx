import './index.css';

import { exitExpandedMode, navigateTo, showToast } from '@devvit/web/client';
import { StrictMode, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { isValidRating } from '../shared/food';
import { Stars } from './components/Stars';
import { createReview } from './lib/api';

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d93900]';

export const Create = () => {
  const [food, setFood] = useState('');
  const [place, setPlace] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit =
    food.trim() && place.trim() && isValidRating(rating) && !submitting;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await createReview({ food, place, rating, review });
      setPostUrl(res.postUrl);
      setDone(true);
      showToast('Review posted!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-900">
        <p className="text-4xl">🎉</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Review posted
        </h1>
        <div className="flex gap-2">
          {postUrl && (
            <button
              className="rounded-full bg-[#d93900] px-4 py-2 text-sm font-semibold text-white cursor-pointer"
              onClick={() => navigateTo(postUrl)}
            >
              View post
            </button>
          )}
          <button
            className="rounded-full bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
            onClick={(e) => exitExpandedMode(e.nativeEvent)}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex h-full max-w-md flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900"
    >
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Add a review
      </h1>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Food
        <input
          className={inputClass}
          value={food}
          maxLength={60}
          placeholder="e.g. Pizza"
          onChange={(e) => setFood(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Place
        <input
          className={inputClass}
          value={place}
          maxLength={80}
          placeholder="e.g. Joe's Pizza, NYC"
          onChange={(e) => setPlace(e.target.value)}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Rating
        <Stars rating={rating} onChange={setRating} size="lg" />
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Review <span className="font-normal text-gray-500">(optional)</span>
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
        className="mt-2 rounded-full bg-[#d93900] px-4 py-2.5 font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Create />
  </StrictMode>
);
