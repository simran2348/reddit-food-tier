import { navigateTo, showToast } from '@devvit/web/client';
import type { ReactNode } from 'react';
import { saveTheme } from '../lib/api';
import { PALETTES, setPalette, useTheme, type Palette } from '../lib/theme';
import { ThemeSurface } from './FoodBackground';

const FEEDBACK_SUBJECT = 'Food Tier - User Feedback';

const modmailUrl = (subredditName: string) =>
  `https://www.reddit.com/message/compose?to=${encodeURIComponent(
    `r/${subredditName}`
  )}&subject=${encodeURIComponent(FEEDBACK_SUBJECT)}`;

const choosePalette = (palette: Palette) => {
  setPalette(palette);
  // Save to the user's account so the theme follows them on every visit.
  saveTheme({ palette: palette.id }).catch((err: unknown) => {
    console.error('Failed to save theme', err);
    showToast("Couldn't save your theme. It'll reset next time.");
  });
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm backdrop-blur">
    <h2 className="font-bold text-ink">{title}</h2>
    <p className="mb-3 text-xs text-muted">{description}</p>
    {children}
  </section>
);

/** A selectable card: a preview on top, the option's name below. */
const Option = ({
  name,
  active,
  onSelect,
  children,
}: {
  name: string;
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}) => (
  <button
    onClick={() => !active && onSelect()}
    aria-pressed={active}
    className={`flex min-w-0 flex-col gap-1 rounded-xl p-1 text-left cursor-pointer transition-colors ${
      active ? 'bg-cta/10 ring-2 ring-cta' : 'ring-1 ring-line hover:bg-soft'
    }`}
  >
    <div className="relative">
      {children}
      {active && (
        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cta text-[11px] font-bold text-cta-ink shadow-md">
          ✓
        </span>
      )}
    </div>
    <span
      className={`truncate px-1 text-xs ${
        active ? 'font-extrabold text-cta' : 'font-semibold text-ink'
      }`}
    >
      {name}
    </span>
  </button>
);

export const Settings = ({
  subredditName,
  header,
}: {
  subredditName: string;
  header: ReactNode;
}) => {
  const palette = useTheme();

  return (
    <div className="flex h-full flex-col">
      {header}
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <Section title="Theme" description="Pick a colour for the app.">
          <div className="grid grid-cols-3 gap-2">
            {PALETTES.map((p) => (
              <Option
                key={p.id}
                name={p.name}
                active={p.id === palette.id}
                onSelect={() => choosePalette(p)}
              >
                <ThemeSurface
                  palette={p}
                  className="relative h-10 rounded-lg"
                />
              </Option>
            ))}
          </div>
        </Section>

        <Section
          title="Feedback"
          description={
            subredditName
              ? `Ideas or issues? Message the r/${subredditName} mods.`
              : 'Ideas or issues? Message the subreddit mods.'
          }
        >
          <button
            onClick={() => navigateTo(modmailUrl(subredditName))}
            disabled={!subredditName}
            className="w-full rounded-full bg-cta px-4 py-2.5 font-bold text-cta-ink shadow-sm cursor-pointer hover:brightness-95 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            ✉️ Send feedback
          </button>
        </Section>
      </main>
    </div>
  );
};
