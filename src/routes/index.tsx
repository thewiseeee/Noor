import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, BookOpen, Layers, Play, Search } from "lucide-react";
import { StoryRings } from "@/components/noor/StoryRings";
import { dailyFeed, dateKey } from "@/lib/daily";
import { getSurah, useEdition } from "@/lib/quran";
import { useSettings } from "@/lib/settings";
import { useBookmarks, useLastRead, useSeen } from "@/lib/storage";
import { translationClass } from "@/components/noor/VerseList";
import { CATEGORIES } from "@/data/stories";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noor — Quran, translation & daily Islamic stories" },
      { name: "description", content: "Read the whole Quran with translation, search any surah, para or ayah, and swipe through daily stories." },
      { property: "og:title", content: "Noor — Quran & daily Islamic stories" },
      { property: "og:description", content: "The whole Quran with translation plus a short daily feed of ayahs, hadith, prophets and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function greeting(h: number) {
  if (h < 5) return "Peaceful night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Home() {
  const { settings } = useSettings();
  const lastRead = useLastRead();
  const { bookmarks } = useBookmarks();
  const [hour, setHour] = useState<number | null>(null);
  useEffect(() => setHour(new Date().getHours()), []);

  const feed = useMemo(() => dailyFeed(), []);
  const seen = useSeen(dateKey());
  const total = feed.reduce((n, c) => n + c.items.length, 0);
  const seenCount = CATEGORIES.reduce((n, c) => n + Math.min(c.perDay, (seen[c.id] ?? -1) + 1), 0);
  const nextCat = CATEGORIES.find((c) => (seen[c.id] ?? -1) < c.perDay - 1)?.id ?? "ayah";

  const ayahOfDay = feed[0]?.items[0];
  const ref = ayahOfDay?.kind === "ayah" ? ayahOfDay.ref : ([94, 5] as [number, number]);
  const lang = settings.translation === "none" ? "en" : settings.translation;
  const ar = useEdition("ar");
  const tr = useEdition(lang);

  return (
    <div className="safe-top px-4 pt-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            As-salamu alaykum{settings.name ? `, ${settings.name}` : ""}
          </p>
          <h1 className="text-3xl font-semibold">{hour === null ? "Welcome" : greeting(hour)}</h1>
        </div>
        <span className="font-arabic text-4xl text-primary">نور</span>
      </header>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's Noor</h2>
          <span className="text-xs font-medium text-muted-foreground">
            {seenCount}/{total} seen
          </span>
        </div>
        <StoryRings />
      </section>

      <Link
        to="/stories/$category"
        params={{ category: nextCat }}
        className="bg-hero pattern-stars relative mt-5 block overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-glow"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">Ayah of the day</p>
        <p className="font-arabic mt-4 text-right text-2xl leading-[2.1]">
          {ar.data?.[ref[0] - 1]?.[ref[1] - 1] ?? "…"}
        </p>
        <p
          dir={lang === "ur" ? "rtl" : "ltr"}
          className={cn("mt-3 line-clamp-4 text-sm opacity-90", translationClass(lang))}
        >
          {tr.data?.[ref[0] - 1]?.[ref[1] - 1] ?? ""}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs opacity-80">
            {getSurah(ref[0])!.name} · {ref[0]}:{ref[1]}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-primary-foreground px-4 py-2 text-xs font-semibold text-primary">
            <Play className="h-3.5 w-3.5 fill-current" /> {seenCount > 0 ? "Continue stories" : "Watch stories"}
          </span>
        </div>
      </Link>

      {lastRead && (
        <Link
          to="/surah/$id"
          params={{ id: String(lastRead.surah) }}
          search={{ ayah: lastRead.ayah }}
          className="mt-4 flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Continue reading</p>
            <p className="truncate font-semibold">
              {getSurah(lastRead.surah)!.name} · Ayah {lastRead.ayah}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3">
        <QuickTile to="/quran" icon={<BookOpen className="h-5 w-5" />} title="Surahs" subtitle="All 114" />
        <QuickTile to="/quran" search={{ tab: "juz" }} icon={<Layers className="h-5 w-5" />} title="Paras" subtitle="All 30 Juz" />
        <QuickTile to="/search" icon={<Search className="h-5 w-5" />} title="Search" subtitle="Words, ayahs" />
        <QuickTile to="/bookmarks" icon={<Bookmark className="h-5 w-5" />} title="Bookmarks" subtitle={`${bookmarks.length} saved`} />
      </section>

      <section className="mt-6 mb-4">
        <h2 className="mb-3 text-lg font-semibold">Popular</h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {[36, 67, 18, 55, 56, 1, 112, 2].map((n) => {
            const s = getSurah(n)!;
            return (
              <Link
                key={n}
                to="/surah/$id"
                params={{ id: String(n) }}
                className="w-32 shrink-0 rounded-3xl border border-border bg-card p-4 shadow-soft"
              >
                <p className="font-arabic text-right text-2xl text-primary">{s.arabic}</p>
                <p className="mt-3 truncate text-sm font-semibold">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.ayahs} ayahs</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function QuickTile({
  to,
  search,
  icon,
  title,
  subtitle,
}: {
  to: "/quran" | "/search" | "/bookmarks";
  search?: { tab: "juz" };
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      {...(search ? { search } : {})}
      className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft transition-transform active:scale-[0.98]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-soft text-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
