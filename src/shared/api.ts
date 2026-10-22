import type { PaletteId } from './theme';

export type FoodReview = {
  id: string;
  username: string;
  food: string;
  place: string;
  rating: number;
  review: string;
  createdAt: number;
  postId?: string;
};

export type TierEntry = {
  place: string;
  average: number;
  count: number;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};

export type InitResponse = {
  username: string | null;
  avatarUrl: string | null;
  subredditName: string;
  /** The user's saved palette, if they've picked one. */
  theme: PaletteId | null;
  myList: FoodReview[];
  foods: string[];
};

export type UserReviewsResponse = {
  username: string;
  reviews: FoodReview[];
};

export type SaveThemeRequest = {
  palette: PaletteId;
};

export type TierResponse = {
  food: string;
  entries: TierEntry[];
};

export type CreateReviewRequest = {
  food: string;
  place: string;
  rating: number;
  review: string;
};

export type CreateReviewResponse = {
  review: FoodReview;
  postUrl: string | null;
};
