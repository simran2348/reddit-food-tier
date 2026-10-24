import { redis } from '@devvit/web/server';
import type { FoodReview, PlaceLocation, TierEntry } from '../../shared/api';
import { TOP_LIMIT, normalizeName } from '../../shared/food';

const keys = {
  review: (id: string) => `review:${id}`,
  userList: (username: string) => `user:${username}:reviews`,
  foods: () => 'foods',
  foodNames: () => 'foods:names',
  // `tier10:` holds averages out of 10; the old `tier:` keys (out of 5)
  // are no longer read.
  tier: (food: string) => `tier10:${food}`,
  tierStats: (food: string) => `tier10:${food}:stats`,
  placeNames: (food: string) => `tier10:${food}:names`,
};

const parseJson = (value: string | undefined): unknown => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const parseLocation = (value: unknown): PlaceLocation | undefined => {
  if (typeof value !== 'object' || value === null) return undefined;
  const { address, lat, lon } = { address: '', lat: NaN, lon: NaN, ...value };
  return typeof address === 'string' &&
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
    ? { address, lat, lon }
    : undefined;
};

const parseImages = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((url): url is string => typeof url === 'string')
    : [];

const parseReview = (data: Record<string, string>): FoodReview | null => {
  if (!data.id || !data.username) return null;
  const rating = Number(data.rating ?? 0);
  const createdAt = Number(data.createdAt ?? 0);
  const location = parseLocation(parseJson(data.location));
  return {
    id: data.id,
    username: data.username,
    title: data.title ?? '',
    food: data.food ?? '',
    place: data.place ?? '',
    ...(location ? { location } : {}),
    // Reviews saved before the 10-point scale were rated out of 5.
    rating: data.scale === '10' ? rating : rating * 2,
    review: data.review ?? '',
    images: parseImages(parseJson(data.images)),
    createdAt,
    postedAt: Number(data.postedAt ?? createdAt),
    ...(data.postId ? { postId: data.postId } : {}),
  };
};

export const saveReview = async (
  input: Omit<FoodReview, 'id' | 'createdAt'>
): Promise<FoodReview> => {
  const createdAt = Date.now();
  const review: FoodReview = {
    ...input,
    id: `${createdAt.toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
  };
  const foodKey = normalizeName(review.food);
  const placeKey = normalizeName(review.place);

  await redis.hSet(keys.review(review.id), {
    id: review.id,
    username: review.username,
    title: review.title,
    food: review.food,
    place: review.place,
    ...(review.location ? { location: JSON.stringify(review.location) } : {}),
    rating: String(review.rating),
    scale: '10',
    review: review.review,
    images: JSON.stringify(review.images),
    createdAt: String(createdAt),
    postedAt: String(review.postedAt),
    ...(review.postId ? { postId: review.postId } : {}),
  });
  await redis.zAdd(keys.userList(review.username), {
    member: review.id,
    score: createdAt,
  });

  // Track foods by popularity and keep the first-seen display name.
  await redis.zIncrBy(keys.foods(), foodKey, 1);
  if (!(await redis.hGet(keys.foodNames(), foodKey))) {
    await redis.hSet(keys.foodNames(), { [foodKey]: review.food.trim() });
  }

  // Update the per-food tier: places ranked by average rating.
  const sum = await redis.hIncrBy(
    keys.tierStats(foodKey),
    `${placeKey}:sum`,
    review.rating
  );
  const count = await redis.hIncrBy(
    keys.tierStats(foodKey),
    `${placeKey}:count`,
    1
  );
  await redis.zAdd(keys.tier(foodKey), {
    member: placeKey,
    score: sum / count,
  });
  if (!(await redis.hGet(keys.placeNames(foodKey), placeKey))) {
    await redis.hSet(keys.placeNames(foodKey), {
      [placeKey]: review.place.trim(),
    });
  }

  return review;
};

export const attachPostToReview = async (reviewId: string, postId: string) => {
  await redis.hSet(keys.review(reviewId), { postId });
};

export const getUserReviews = async (
  username: string
): Promise<FoodReview[]> => {
  const ids = await redis.zRange(keys.userList(username), 0, -1, {
    by: 'rank',
    reverse: true,
  });
  const reviews = await Promise.all(
    ids.map(({ member }) => redis.hGetAll(keys.review(member)))
  );
  return reviews.flatMap((data) => {
    const review = parseReview(data);
    return review ? [review] : [];
  });
};

export const getTopFoods = async (limit = 20): Promise<string[]> => {
  const foods = await redis.zRange(keys.foods(), 0, limit - 1, {
    by: 'rank',
    reverse: true,
  });
  if (foods.length === 0) return [];
  const names = await redis.hMGet(
    keys.foodNames(),
    foods.map(({ member }) => member)
  );
  return foods.map(({ member }, i) => names[i] ?? member);
};

export const getFoodTier = async (food: string): Promise<TierEntry[]> => {
  const foodKey = normalizeName(food);
  const places = await redis.zRange(keys.tier(foodKey), 0, TOP_LIMIT - 1, {
    by: 'rank',
    reverse: true,
  });
  if (places.length === 0) return [];
  const placeKeys = places.map(({ member }) => member);
  const [names, counts] = await Promise.all([
    redis.hMGet(keys.placeNames(foodKey), placeKeys),
    redis.hMGet(
      keys.tierStats(foodKey),
      placeKeys.map((key) => `${key}:count`)
    ),
  ]);
  return places.map(({ member, score }, i) => ({
    place: names[i] ?? member,
    average: Math.round(score * 10) / 10,
    count: Number(counts[i] ?? 0),
  }));
};
