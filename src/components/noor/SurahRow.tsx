import { Link } from "@tanstack/react-router";
import type { Surah } from "@/lib/quran";

export function NumberBadge({ n }: { n: number }) {
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full text-primary/25" aria-hidden>
        <rect x="9" y="9" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="9" y="9" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" transform="rotate(45 22 22)" />
      </svg>
      <span className="relative text-sm font-semibold text-primary">{n}</span>
    </span>
  );
}

export function SurahRow({ surah }: { surah: Surah }) {
  return (
    <Link
      to="/surah/$id"
      params={{ id: String(surah.number) }}
      className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted active:bg-muted"
    >
      <NumberBadge n={surah.number} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{surah.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {surah.meaning} · {surah.revelation} · {surah.ayahs} ayahs
        </p>
      </div>
      <span className="font-arabic text-2xl text-primary">{surah.arabic}</span>
    </Link>
  );
}
