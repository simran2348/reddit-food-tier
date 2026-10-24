import { context, reddit, redis } from '@devvit/web/server';
import type { FoodReview } from '../../shared/api';

const HUB_POST_KEY = 'hub:postId';

export const postUrl = (postId: string) =>
  `https://reddit.com/r/${context.subredditName}/comments/${postId}`;

/** Creates the main Food Tier post that hosts the splash screen. */
export const createHubPost = async () => {
  const post = await reddit.submitCustomPost({
    title: 'Food Tier — share your food list and see the top spots',
  });
  await redis.set(HUB_POST_KEY, post.id);
  return post;
};

/** Returns the existing hub post id, if one was already created for this install. */
export const getHubPostId = async (): Promise<string | undefined> =>
  redis.get(HUB_POST_KEY);

/** Shares a single review as its own post in the subreddit. */
export const createReviewPost = async (review: FoodReview) =>
  reddit.submitCustomPost({
    title: `u/${review.username} rated ${review.food} at ${review.place}: ${review.rating}/10`,
    postData: { reviewId: review.id },
  });
