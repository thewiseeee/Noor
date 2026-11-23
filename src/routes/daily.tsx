import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, Play } from "lucide-react";
import { STORY_BG } from "@/components/noor/story-bg";
import { CATEGORIES } from "@/data/stories";
import { dailyFeed, dateKey } from "@/lib/daily";
import { useSeen } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Today's Noor — daily ayahs, hadith & Islamic facts | Noor" },
      { name: "description", content: "A short, limited daily feed: Quran ayahs, hadith, prophets, way of life, aqeedah, fiqh, tajweed and history." },
      { property: "og:title", content: "Today's Noor — daily Islamic stories" },
      { property: "og:description", content: "Swipe through today's ayahs, hadith and Islamic facts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const feed = useMemo(() => dailyFeed(), []);
  const seen = useSeen(dateKey());
  const total = feed.reduce((n, c) => n + c.items.length, 0);
  const seenCount = CATEGORIES.reduce((n, c) => n + Math.min(c.perDay, (seen[c.id] ?? -1) + 1), 0);
  const nextCat = CATEGORIES.find((c) => (seen[c.id] ?? -1) < c.perDay - 1);
  const pct = Math.round((seenCount / total) * 100);

  return (
    <div className="safe-top px-4 pt-6">
      <h1 className="text-3xl font-semibold">Today's Noor</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} short stories, refreshed every day. Swipe up for the next one.
      </p>

      <div className="bg-hero pattern-stars mt-5 overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">Your progress</p>
            <p className="mt-1 text-3xl font-semibold">
              {seenCount}<span className="text-lg opacity-70"> / {total}</span>
            </p>
          </div>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-sm font-semibold"
            style={{
              background: `conic-gradient(var(--gold) ${pct * 3.6}deg, color-mix(in oklab, var(--primary-foreground) 18%, transparent) 0)`,
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">{pct}%</span>
          </div>
        </div>
        <Link
          to="/stories/$category"
          params={{ category: nextCat?.id ?? "ayah" }}
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-primary-foreground font-semibold text-primary"
        >
          <Play className="h-4 w-4 fill-current" />
          {!nextCat ? "Watch again" : seenCount ? "Continue" : "Start today's stories"}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 pb-4">
        {CATEGORIES.map((c) => {
          const watched = Math.min(c.perDay, (seen[c.id] ?? -1) + 1);
          const done = watched >= c.perDay;
          return (
            <Link
              key={c.id}
              to="/stories/$category"
              params={{ category: c.id }}
              className={cn(STORY_BG[c.id], "relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl p-4 text-story-foreground shadow-soft transition-transform active:scale-[0.98]")}
            >
              <div className="pattern-stars absolute inset-0" />
              <div className="relative flex items-center justify-between">
                <span className="rounded-full bg-story-glass px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                  {watched}/{c.perDay}
                </span>
                {done && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-story-foreground text-story-ink">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <p className="font-arabic relative text-center text-6xl">{c.glyph}</p>
              <div className="relative">
                <p className="font-display text-lg font-semibold leading-tight">{c.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-story-muted">{c.tagline}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
