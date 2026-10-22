import { redis } from '@devvit/web/server';
import { isPaletteId, type PaletteId } from '../../shared/theme';

const themeKey = (username: string) => `user:${username}:theme`;

export const getUserTheme = async (
  username: string
): Promise<PaletteId | null> => {
  const value = await redis.get(themeKey(username));
  return isPaletteId(value) ? value : null;
};

export const saveUserTheme = async (username: string, palette: PaletteId) => {
  await redis.set(themeKey(username), palette);
};
