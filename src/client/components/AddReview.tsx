import { navigateTo, showToast } from '@devvit/web/client';
import { useState, type FormEvent } from 'react';
import { createReview } from '../lib/api';
import { draftToRequest, emptyDraft, isDraftComplete } from '../lib/draft';
import { ReviewFields, type ReviewDraft } from './ReviewFields';
import { ScreenHeader, Spinner } from './ui';

export const AddReview = ({
  foods,
  onPosted,
}: {
  foods: string[];
  onPosted: () => void;
}) => {
  const [draft, setDraft] = useState<ReviewDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState<{ postUrl: string | null }>();

  const canSubmit = isDraftComplete(draft) && !submitting;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await createReview(draftToRequest(draft));
      setPosted({ postUrl: res.postUrl });
      showToast('Review posted!');
      onPosted();
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
        <p className="text-5xl">🎉</p>
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
            onClick={() => {
              setDraft(emptyDraft());
              setPosted(undefined);
            }}
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
        <ReviewFields
          draft={draft}
          foods={foods}
          onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-cta px-4 py-3 font-bold text-cta-ink shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" /> Posting…
            </>
          ) : (
            'Post review'
          )}
        </button>
      </form>
    </div>
  );
};
