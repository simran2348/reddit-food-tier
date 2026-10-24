import { useState } from 'react';
import type { InitResponse } from '../../shared/api';
import { Calendar } from './Calendar';
import { FoodList, FoodTier } from './reviews';
import { EmptyState, ScreenHeader, Segmented } from './ui';

type View = 'list' | 'calendar' | 'tier';

const VIEWS: { id: View; label: string }[] = [
  { id: 'list', label: 'My List' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'tier', label: 'Tier List' },
];

export const MyFood = ({
  data,
  error,
}: {
  data: InitResponse | null;
  error: string | null;
}) => {
  const [view, setView] = useState<View>('list');

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Food Tier"
        subtitle={
          data?.username ? `u/${data.username}` : 'Rate the spots you love'
        }
      />
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <Segmented options={VIEWS} value={view} onChange={setView} />
        {error ? (
          <EmptyState>Couldn't load: {error}</EmptyState>
        ) : !data ? (
          <EmptyState>Loading…</EmptyState>
        ) : view === 'list' ? (
          <FoodList reviews={data.myList} />
        ) : view === 'calendar' ? (
          <Calendar reviews={data.myList} />
        ) : (
          <FoodTier foods={data.foods} />
        )}
      </main>
    </div>
  );
};
