import { CATEGORIES, type CategoryId, type StoryItem } from "@/data/stories";

/** Local calendar day number — changes at the user's local midnight. */
export function dayNumber(d: Date = new Date()): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Fixed shuffled order per category, so days walk through every item before repeating. */
export function shuffledOrder(n: number, seed: string): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(hash(seed));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}

export function dailyPicks<T>(items: T[], count: number, day: number, seed: string): T[] {
  if (items.length === 0) return [];
  const n = Math.min(count, items.length);
  const order = shuffledOrder(items.length, seed);
  const start = (day * n) % items.length;
  return Array.from({ length: n }, (_, i) => items[order[(start + i) % items.length]!]!);
}

export interface DailyCategory {
  id: CategoryId;
  items: StoryItem[];
}

export function dailyFeed(day: number = dayNumber()): DailyCategory[] {
  return CATEGORIES.map((c) => ({ id: c.id, items: dailyPicks(c.items, c.perDay, day, c.id) }));
}

export const dailyTotal = (feed: DailyCategory[]) => feed.reduce((n, c) => n + c.items.length, 0);
