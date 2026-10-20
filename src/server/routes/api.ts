import { Hono } from 'hono';
import { reddit } from '@devvit/web/server';
import type {
  CreateReviewRequest,
  CreateReviewResponse,
  ErrorResponse,
  InitResponse,
  TierResponse,
} from '../../shared/api';
import { isValidRating } from '../../shared/food';
import { createReviewPost, postUrl } from '../core/post';
import {
  attachPostToReview,
  getFoodTier,
  getTopFoods,
  getUserReviews,
  saveReview,
} from '../core/reviews';

const MAX_TEXT = { food: 60, place: 80, review: 500 };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

export const api = new Hono();

api.get('/init', async (c) => {
  try {
    const username = (await reddit.getCurrentUsername()) ?? null;
    const [myList, foods] = await Promise.all([
      username ? getUserReviews(username) : Promise.resolve([]),
      getTopFoods(),
    ]);
    return c.json<InitResponse>({ username, myList, foods });
  } catch (error) {
    console.error('API init error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage(error) },
      500
    );
  }
});

api.get('/tier', async (c) => {
  const food = c.req.query('food')?.trim();
  if (!food) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'food is required' },
      400
    );
  }
  try {
    return c.json<TierResponse>({ food, entries: await getFoodTier(food) });
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
  const rating = Number(body.rating);

  if (!food || !place || !isValidRating(rating)) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Food, place and a 1–5 rating are required' },
      400
    );
  }
  if (
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
    const saved = await saveReview({ username, food, place, rating, review });

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
