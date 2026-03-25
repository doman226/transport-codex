type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type RuntimeCacheStore = Map<string, CacheEntry<unknown>>;

declare global {
  // eslint-disable-next-line no-var
  var __transportRuntimeCache__: RuntimeCacheStore | undefined;
}

const cacheStore: RuntimeCacheStore =
  globalThis.__transportRuntimeCache__ ?? new Map<string, CacheEntry<unknown>>();

if (!globalThis.__transportRuntimeCache__) {
  globalThis.__transportRuntimeCache__ = cacheStore;
}

export const readRuntimeCache = <T>(key: string): T | null => {
  const entry = cacheStore.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value as T;
};

export const writeRuntimeCache = <T>(
  key: string,
  value: T,
  ttlMs: number
): void => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + Math.max(1, ttlMs)
  });
};

export const minutesToMs = (minutes: number, fallbackMinutes: number): number => {
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : fallbackMinutes;
  return safeMinutes * 60 * 1000;
};
