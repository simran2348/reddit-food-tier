import type {
  CreateReviewRequest,
  CreateReviewResponse,
  ErrorResponse,
  ImportPostResponse,
  InitResponse,
  MyPostsResponse,
  PlaceSearchResponse,
  ProfileResponse,
  SaveThemeRequest,
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

export const fetchProfile = () => request<ProfileResponse>('/api/profile');

export const fetchInit = () => request<InitResponse>('/api/init');

/** One food category's tier, or every category combined when `food` is null. */
export const fetchTier = (food: string | null) =>
  request<TierResponse>(
    food ? `/api/tier?food=${encodeURIComponent(food)}` : '/api/tier'
  );

export const fetchUserReviews = (username: string) =>
  request<UserReviewsResponse>(
    `/api/users/${encodeURIComponent(username)}/reviews`
  );

export const saveTheme = (body: SaveThemeRequest) =>
  request<{ status: 'ok' }>('/api/theme', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const fetchMyPosts = (after?: string) =>
  request<MyPostsResponse>(
    `/api/my-posts${after ? `?after=${encodeURIComponent(after)}` : ''}`
  );

/** Import by post id (picked from the list) or by a pasted link. */
export const importPost = (source: { id: string } | { url: string }) =>
  request<ImportPostResponse>(
    `/api/import?${new URLSearchParams('id' in source ? { id: source.id } : { url: source.url })}`
  );

export const searchPlaces = (query: string) =>
  request<PlaceSearchResponse>(`/api/places?q=${encodeURIComponent(query)}`);

export const createReview = (body: CreateReviewRequest) =>
  request<CreateReviewResponse>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(body),
  });
