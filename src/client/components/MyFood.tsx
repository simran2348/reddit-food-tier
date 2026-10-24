import type { InitResponse } from '../../shared/api';
import { PostPicker } from './PostPicker';
import { FoodTier } from './reviews';
import { EmptyState, LoadingState, ScreenHeader, Segmented } from './ui';

export type MyFoodView = 'list' | 'tier';

const VIEWS: { id: MyFoodView; label: string }[] = [
  { id: 'list', label: 'My List' },
  { id: 'tier', label: 'Tier List' },
];

export const MyFood = ({
  data,
  error,
  view,
  onViewChange,
  onAdded,
}: {
  data: InitResponse | null;
  error: string | null;
  view: MyFoodView;
  onViewChange: (view: MyFoodView) => void;
  /** Posts were added to the tier list from the post picker. */
  onAdded: () => void;
}) => {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Food Tier"
        subtitle={
          data?.username ? `u/${data.username}` : 'Rate the spots you love'
        }
      />
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <Segmented options={VIEWS} value={view} onChange={onViewChange} />
        {error ? (
          <EmptyState>Couldn't load: {error}</EmptyState>
        ) : !data ? (
          <LoadingState />
        ) : view === 'list' ? (
          <PostPicker
            subredditName={data.subredditName}
            foods={data.foods}
            onAdded={onAdded}
          />
        ) : (
          <FoodTier foods={data.foods} />
        )}
      </main>
    </div>
  );
};
