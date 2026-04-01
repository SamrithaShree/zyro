import { PersistOptions } from "zustand/middleware";
import { StateStorage } from "zustand/middleware";

const storage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // quota exceeded — ignore
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const PERSIST_KEY_PREFIX = "zyro_";

export function makePersistConfig<T>(
  name: string,
  version = 1,
  partialize?: (state: T) => Partial<T>
): PersistOptions<T, Partial<T>> {
  return {
    name: `${PERSIST_KEY_PREFIX}${name}`,
    storage: {
      getItem: (key) => {
        const raw = storage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as { state: Partial<T>; version: number };
      },
      setItem: (key, value) => {
        storage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => {
        storage.removeItem(key);
      },
    },
    version,
    partialize: partialize as (state: T) => Partial<T>,
  };
}
