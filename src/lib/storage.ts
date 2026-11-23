import { useCallback, useEffect, useState } from "react";

export interface Bookmark {
  surah: number;
  ayah: number;
  savedAt: number;
}

export interface LastRead {
  surah: number;
  ayah: number;
  at: number;
}

const BM_KEY = "noor.bookmarks.v1";
const LR_KEY = "noor.lastread.v1";
const EVT = "noor-storage";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
    const onEvt = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) setValue(read(key, fallback));
    };
    window.addEventListener(EVT, onEvt);
    return () => window.removeEventListener(EVT, onEvt);
    // fallback is a stable literal per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}

export function useBookmarks() {
  const bookmarks = useStored<Bookmark[]>(BM_KEY, []);
  const isBookmarked = useCallback(
    (surah: number, ayah: number) => bookmarks.some((b) => b.surah === surah && b.ayah === ayah),
    [bookmarks],
  );
  const toggle = useCallback((surah: number, ayah: number) => {
    const list = read<Bookmark[]>(BM_KEY, []);
    const exists = list.some((b) => b.surah === surah && b.ayah === ayah);
    write(
      BM_KEY,
      exists
        ? list.filter((b) => !(b.surah === surah && b.ayah === ayah))
        : [{ surah, ayah, savedAt: Date.now() }, ...list],
    );
    return !exists;
  }, []);
  return { bookmarks, isBookmarked, toggle };
}

export function useLastRead() {
  return useStored<LastRead | null>(LR_KEY, null);
}

export function saveLastRead(surah: number, ayah: number) {
  write(LR_KEY, { surah, ayah, at: Date.now() });
}

/* ---------- daily feed seen state ---------- */
const SEEN_KEY = "noor.seen.v1";

export function useSeen(dateKey: string) {
  const all = useStored<Record<string, Record<string, number>>>(SEEN_KEY, {});
  return all[dateKey] ?? {};
}

export function markSeen(dateKey: string, category: string, index: number) {
  const all = read<Record<string, Record<string, number>>>(SEEN_KEY, {});
  const today = all[dateKey] ?? {};
  if ((today[category] ?? -1) >= index) return;
  // keep only today's record so storage never grows
  write(SEEN_KEY, { [dateKey]: { ...today, [category]: index } });
}
