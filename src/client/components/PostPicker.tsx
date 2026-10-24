import { useCallback, useEffect, useState } from 'react';
import type { MyPostsResponse } from '../../shared/api';
import { fetchMyPosts } from '../lib/api';
import { ImportWizard } from './ImportWizard';
import { EmptyState, LoadingState } from './ui';

type Post = MyPostsResponse['posts'][number];

const formatDay = (ms: number) =>
  new Date(ms).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * The user's own posts in this subreddit, a page at a time (shown in My
 * List). Tick posts and add them to the tier list through a step-by-step
 * preview. Lives inside a scrolling container; the action bar sticks to its
 * bottom.
 */
export const PostPicker = ({
  subredditName,
  foods,
  onAdded,
}: {
  subredditName: string;
  foods: string[];
  onAdded: () => void;
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const applyPage = useCallback((res: MyPostsResponse, append: boolean) => {
    setPosts((prev) => (append ? [...prev, ...res.posts] : res.posts));
    setCursor(res.nextCursor);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMyPosts()
      .then((res) => !cancelled && applyPage(res, false))
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [applyPage]);

  const loadMore = (after: string) => {
    setLoading(true);
    fetchMyPosts(after)
      .then((res) => applyPage(res, true))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const toggle = (postId: string) =>
    setSelected((ids) =>
      ids.includes(postId)
        ? ids.filter((id) => id !== postId)
        : [...ids, postId]
    );

  return (
    <section className="flex flex-col gap-2">
      <div className="px-1">
        <h2 className="font-extrabold text-ink">
          {subredditName ? `Your posts in r/${subredditName}` : 'Your posts'}
        </h2>
        {posts.length > 0 && (
          <p className="text-xs text-muted">
            Tick posts to add them to your tier list.
          </p>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {posts.map((post) => {
          const checked = selected.includes(post.postId);
          return (
            <li key={post.postId}>
              <label
                className={`flex items-center gap-3 rounded-xl border bg-surface p-2.5 backdrop-blur transition-colors ${
                  post.imported
                    ? 'cursor-not-allowed border-line opacity-60'
                    : checked
                      ? 'cursor-pointer border-cta bg-cta/10'
                      : 'cursor-pointer border-line hover:bg-soft'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={post.imported}
                  onChange={() => toggle(post.postId)}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--cta)]"
                />
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-cta/15 text-2xl">
                    🍽️
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-semibold text-ink">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {formatDay(post.postedAt)}
                    {post.imported && ' · In your tier'}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {error ? (
        <EmptyState>Couldn't load your posts: {error}</EmptyState>
      ) : loading ? (
        <LoadingState label="Loading your posts…" />
      ) : posts.length === 0 ? (
        <EmptyState>You haven't posted in this subreddit yet.</EmptyState>
      ) : cursor ? (
        <button
          onClick={() => loadMore(cursor)}
          className="mx-auto my-2 rounded-full border border-line bg-soft px-5 py-2 text-sm font-bold text-soft-ink cursor-pointer hover:brightness-95 transition"
        >
          Load more
        </button>
      ) : (
        <p className="py-3 text-center text-xs text-muted">
          That's all your posts here.
        </p>
      )}

      {selected.length > 0 && (
        <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-line bg-surface px-4 py-3 backdrop-blur">
          <button
            onClick={() => setSelected([])}
            className="text-sm font-semibold text-muted cursor-pointer hover:text-ink"
          >
            Clear
          </button>
          <button
            onClick={() => setImporting(true)}
            className="flex-1 rounded-full bg-cta px-4 py-2.5 font-bold text-cta-ink shadow-md cursor-pointer hover:brightness-95 transition"
          >
            Add {selected.length} to tier →
          </button>
        </div>
      )}

      {importing && (
        <ImportWizard
          postIds={selected}
          foods={foods}
          onCancel={() => setImporting(false)}
          onDone={(addedIds) => {
            setImporting(false);
            setSelected([]);
            setPosts((prev) =>
              prev.map((p) =>
                addedIds.includes(p.postId) ? { ...p, imported: true } : p
              )
            );
            onAdded();
          }}
        />
      )}
    </section>
  );
};
