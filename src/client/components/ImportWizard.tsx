import { showToast } from '@devvit/web/client';
import { useEffect, useState } from 'react';
import type { ImportPostResponse } from '../../shared/api';
import { createReview, importPost } from '../lib/api';
import { draftToRequest, emptyDraft, isDraftComplete } from '../lib/draft';
import { useTheme } from '../lib/theme';
import { ThemeSurface } from './FoodBackground';
import { ReviewFields, type ReviewDraft } from './ReviewFields';
import {
  BackButton,
  EmptyState,
  LoadingState,
  ScreenHeader,
  Spinner,
} from './ui';

type Item = { post: ImportPostResponse; draft: ReviewDraft };

/**
 * Full-screen, one-post-per-step preview of the posts being added to the
 * tier list. Each step can be edited (food category, café, rating, …);
 * the last step submits them all.
 */
export const ImportWizard = ({
  postIds,
  foods,
  onCancel,
  onDone,
}: {
  postIds: string[];
  foods: string[];
  onCancel: () => void;
  /** Called with the ids of the posts that were added. */
  onDone: (addedIds: string[]) => void;
}) => {
  const [items, setItems] = useState<Item[] | null>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Load every selected post up front so the steps don't wait.
  useEffect(() => {
    let cancelled = false;
    void Promise.allSettled(postIds.map((id) => importPost({ id }))).then(
      (results) => {
        if (cancelled) return;
        const loaded = results.flatMap((r) =>
          r.status === 'fulfilled'
            ? [
                {
                  post: r.value,
                  draft: {
                    ...emptyDraft(),
                    title: r.value.title,
                    // Long posts are trimmed to the review length limit.
                    review: r.value.body.slice(0, 2000),
                  },
                },
              ]
            : []
        );
        const failed = results.length - loaded.length;
        if (failed) {
          showToast(
            `Couldn't load ${failed} ${failed === 1 ? 'post' : 'posts'}; skipping.`
          );
        }
        setItems(loaded);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [postIds]);

  const item = items?.[step];
  const isLast = items ? step === items.length - 1 : false;

  const update = (patch: Partial<ReviewDraft>) =>
    setItems((prev) =>
      prev
        ? prev.map((it, i) =>
            i === step ? { ...it, draft: { ...it.draft, ...patch } } : it
          )
        : prev
    );

  const submit = async () => {
    if (!items || submitting) return;
    setSubmitting(true);
    const added: string[] = [];
    for (const { post, draft } of items) {
      try {
        await createReview(draftToRequest(draft, post.postId));
        added.push(post.postId);
      } catch (err) {
        console.error(`Failed to add post ${post.postId}`, err);
      }
    }
    setSubmitting(false);
    const failed = items.length - added.length;
    showToast(
      failed
        ? `Added ${added.length}; ${failed} couldn't be added.`
        : `Added ${added.length} to your tier list!`
    );
    onDone(added);
  };

  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-[768px] flex-col">
      <ThemeSurface
        palette={useTheme()}
        withArt={false}
        className="absolute inset-0 -z-10"
      />
      <ScreenHeader
        title="Add to tier"
        {...(items && items.length > 0
          ? { subtitle: `Post ${step + 1} of ${items.length}` }
          : {})}
        left={
          <BackButton
            onClick={() => (step > 0 ? setStep(step - 1) : onCancel())}
          />
        }
      />
      {items && items.length > 1 && (
        <div className="h-1 bg-line">
          <div
            className="h-full bg-cta transition-all"
            style={{ width: `${((step + 1) / items.length) * 100}%` }}
          />
        </div>
      )}

      {!items ? (
        <LoadingState label="Loading your posts…" />
      ) : !item ? (
        <EmptyState>None of those posts could be loaded.</EmptyState>
      ) : (
        <>
          <main
            // Re-mount per step so scroll position and pickers reset.
            key={item.post.postId}
            className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 overflow-y-auto p-4"
          >
            {item.post.images.length > 0 && (
              <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4">
                {item.post.images.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-40 w-40 shrink-0 snap-start rounded-xl object-cover shadow-sm"
                  />
                ))}
              </div>
            )}
            <ReviewFields draft={item.draft} foods={foods} onChange={update} />
          </main>

          <div className="flex gap-2 border-t border-line bg-surface px-4 py-3 backdrop-blur">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : onCancel())}
              className="rounded-full border border-line bg-soft px-5 py-2.5 text-sm font-bold text-soft-ink cursor-pointer hover:brightness-95"
            >
              {step > 0 ? 'Back' : 'Cancel'}
            </button>
            <button
              disabled={!isDraftComplete(item.draft) || submitting}
              onClick={() => (isLast ? void submit() : setStep(step + 1))}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cta px-4 py-2.5 font-bold text-cta-ink shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" /> Adding…
                </>
              ) : isLast ? (
                `Submit${items.length > 1 ? ` all ${items.length}` : ''}`
              ) : (
                'Next →'
              )}
            </button>
          </div>
          {!isDraftComplete(item.draft) && (
            <p className="bg-surface px-4 pb-3 text-center text-xs text-muted">
              Add a food category, café and rating to continue.
            </p>
          )}
        </>
      )}
    </div>
  );
};
