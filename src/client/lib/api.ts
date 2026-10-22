import type {
  CreateReviewRequest,
  CreateReviewResponse,
  ErrorResponse,
  InitResponse,
  TierResponse,
  UserReviewsResponse,
} from '../../shared/api';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const error: Partial<ErrorResponse> = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed (${res.status})`);
  }
  const data: T = await res.json();
  return data;
};

export const fetchInit = () => request<InitResponse>('/api/init');

export const fetchTier = (food: string) =>
  request<TierResponse>(`/api/tier?food=${encodeURIComponent(food)}`);

export const fetchUserReviews = (username: string) =>
  request<UserReviewsResponse>(
    `/api/users/${encodeURIComponent(username)}/reviews`
  );

export const createReview = (body: CreateReviewRequest) =>
  request<CreateReviewResponse>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(body),
  });
