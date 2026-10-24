import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  CreateReviewRequest,
  CreateReviewResponse,
  ErrorResponse,
  ImportPostResponse,
  MyPostsResponse,
  PlaceLocation,
  PlaceSearchResponse,
  InitResponse,
  ProfileResponse,
  SaveThemeRequest,
  TierResponse,
  UserReviewsResponse,
} from '../../shared/api';
import { isPaletteId } from '../../shared/theme';
import { isValidRating } from '../../shared/food';
import {
  fetchTile,
  importPost,
  isShareLink,
  listMyPosts,
  parsePostId,
  searchPlaces,
} from '../core/external';
import { createReviewPost, postUrl } from '../core/post';
import { getUserTheme, saveUserTheme } from '../core/preferences';
import {
  attachPostToReview,
  getAllTiers,
  getFoodTier,
  getTopFoods,
  getUserReviews,
  saveReview,
} from '../core/reviews';

const MAX_TEXT = { title: 120, food: 60, place: 80, review: 2000 };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

const validLocation = (
  value: Partial<PlaceLocation> | undefined
): PlaceLocation | undefined => {
  if (!value) return undefined;
  const { address, lat, lon } = value;
  if (typeof lat !== 'number' || typeof lon !== 'number') return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return undefined;
  return { address: String(address ?? '').slice(0, 200), lat, lon };
};

export const api = new Hono();

api.get('/profile', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? null;
    const [avatarUrl, theme] = await Promise.all([
      username
        ? reddit.getSnoovatarUrl(username).catch(() => undefined)
        : Promise.resolve(undefined),
      username ? getUserTheme(username) : Promise.resolve(null),
    ]);
    return c.json<ProfileResponse>({
      username,
      avatarUrl: avatarUrl ?? null,
      theme,
    });
  } catch (error) {
    console.error('API profile error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});

api.get('/init', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? null;
    const [myList, foods, theme] = await Promise.all([
      username ? getUserReviews(username) : Promise.resolve([]),
      getTopFoods(),
      username ? getUserTheme(username) : Promise.resolve(null),
    ]);
    return c.json<InitResponse>({
      username,
      subredditName: context.subredditName ?? '',
      theme,
      myList,
      foods,
    });
  } catch (error) {
    console.error('API init error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});

api.get('/users/:username/reviews', async (c) => {
  const input = c.req
    .param('username')
    .trim()
    .replace(/^\/?u\//i, '');
  if (!input) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'username is required' },
      400
    );
  }
  try {
    // Reviews are keyed by the exact username, so resolve its canonical casing.
    const user = await reddit.getUserByUsername(input).catch(() => undefined);
    if (!user) {
      return c.json<ErrorResponse>(
        { status: 'error', message: `u/${input} not found` },
        404
      );
    }
    const username = user.username;
    return c.json<UserReviewsResponse>({
      username,
      reviews: await getUserReviews(username),
    });
  } catch (error) {
    console.error(`API user reviews error for ${input}:`, error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});

api.post('/theme', async (c) => {
  const username = await reddit.getCurrentUsername();
  if (!username) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be logged in' },
      401
    );
  }
  const body = await c.req.json<Partial<SaveThemeRequest>>();
  const palette = body.palette;
  if (!isPaletteId(palette)) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Unknown theme' },
      400
    );
  }
  try {
    await saveUserTheme(username, palette);
    return c.json({ status: 'ok' });
  } catch (error) {
    console.error(`API save theme error for ${username}:`, error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});

api.get('/import', async (c) => {
  const username = await reddit.getCurrentUsername();
  if (!username) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be logged in' },
      401
    );
  }
  try {
    const id = c.req.query('id');
    const url = c.req.query('url') ?? '';
    if (!id && isShareLink(url)) {
      return c.json<ErrorResponse>(
        {
          status: 'error',
          message:
            "Share links can't be imported. Open the post and copy its full link (…/comments/…).",
        },
        400
      );
    }
    const postId = id ? id.replace(/^t3_/, '') : parsePostId(url);
    if (!postId) {
      return c.json<ErrorResponse>(
        {
          status: 'error',
          message: "That doesn't look like a Reddit post link",
        },
        400
      );
    }
    return c.json<ImportPostResponse>(await importPost(postId, username));
  } catch (error) {
    console.error('API import error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      400
    );
  }
});

api.get('/my-posts', async (c) => {
  const username = await reddit.getCurrentUsername();
  if (!username) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be logged in' },
      401
    );
  }
  try {
    const reviews = await getUserReviews(username);
    const imported = new Set(
      reviews.flatMap((r) => (r.postId ? [r.postId] : []))
    );
    const after = c.req.query('after')?.trim() || undefined;
    return c.json<MyPostsResponse>(
      await listMyPosts(username, imported, after)
    );
  } catch (error) {
    console.error('API my-posts error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});

api.get('/places', async (c) => {
  const query = c.req.query('q')?.trim() ?? '';
  if (query.length < 2) {
    return c.json<PlaceSearchResponse>({ places: [] });
  }
  try {
    return c.json<PlaceSearchResponse>(await searchPlaces(query.slice(0, 100)));
  } catch (error) {
    console.error('API place search error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      502
    );
  }
});

api.get('/tiles/:style/:z/:x/:y', async (c) => {
  const { style, z, x, y } = c.req.param();
  try {
    const tile = await fetchTile(style, z, x, y);
    return tile ?? c.body(null, 404);
  } catch (error) {
    console.error('API tile error:', error);
    return c.body(null, 502);
  }
});

api.get('/tier', async (c) => {
  // No food means the combined "All" tier.
  const food = c.req.query('food')?.trim() ?? '';
  try {
    const entries = food ? await getFoodTier(food) : await getAllTiers();
    return c.json<TierResponse>({ food, entries });
  } catch (error) {
    console.error(`API tier error for ${food}:`, error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});

api.post('/reviews', async (c) => {
  const username = await reddit.getCurrentUsername();
  if (!username) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be logged in' },
      401
    );
  }

  const body = await c.req.json<Partial<CreateReviewRequest>>();
  const food = body.food?.trim() ?? '';
  const place = body.place?.trim() ?? '';
  const review = body.review?.trim() ?? '';
  const title = body.title?.trim() || `${food} at ${place}`;
  const rating = Number(body.rating);
  const location = validLocation(body.location);

  if (!food || !place || !isValidRating(rating)) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Food, place and a 1–10 rating are required',
      },
      400
    );
  }
  if (
    title.length > MAX_TEXT.title ||
    food.length > MAX_TEXT.food ||
    place.length > MAX_TEXT.place ||
    review.length > MAX_TEXT.review
  ) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'One of the fields is too long' },
      400
    );
  }

  try {
    // Imported reviews keep the original post (and its photos and date).
    if (body.importedPostId) {
      const source = await importPost(
        body.importedPostId.replace(/^t3_/, ''),
        username
      );
      const existing = await getUserReviews(username);
      if (existing.some((r) => r.postId === source.postId)) {
        return c.json<ErrorResponse>(
          { status: 'error', message: "You've already added this post." },
          409
        );
      }
      const saved = await saveReview({
        username,
        title,
        food,
        place,
        ...(location ? { location } : {}),
        rating,
        review,
        images: source.images,
        postedAt: source.postedAt,
        postId: source.postId,
      });
      return c.json<CreateReviewResponse>({
        review: saved,
        postUrl: postUrl(source.postId.replace(/^t3_/, '')),
      });
    }

    const saved = await saveReview({
      username,
      title,
      food,
      place,
      ...(location ? { location } : {}),
      rating,
      review,
      images: [],
      postedAt: Date.now(),
    });

    // The review is saved even if sharing it as a post fails.
    let url: string | null = null;
    try {
      const post = await createReviewPost(saved);
      await attachPostToReview(saved.id, post.id);
      saved.postId = post.id;
      url = postUrl(post.id);
    } catch (error) {
      console.error(`Failed to create post for review ${saved.id}:`, error);
    }

    return c.json<CreateReviewResponse>({ review: saved, postUrl: url });
  } catch (error) {
    console.error('API create review error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});
