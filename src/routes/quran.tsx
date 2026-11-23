import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import { PageHeader } from "@/components/noor/PageHeader";
import { NumberBadge, SurahRow } from "@/components/noor/SurahRow";
import { getSurah, juzRange, JUZ_NAMES, matchSurahs, SURAHS } from "@/lib/quran";
import { cn } from "@/lib/utils";

type Tab = "surah" | "juz";

export const Route = createFileRoute("/quran")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => (s["tab"] === "juz" ? { tab: "juz" } : {}),
  head: () => ({
    meta: [
      { title: "The Holy Quran — 114 Surahs & 30 Paras | Noor" },
      { name: "description", content: "Browse all 114 surahs and 30 paras (juz) of the Quran with Arabic and translation." },
      { property: "og:title", content: "The Holy Quran — Surahs & Paras | Noor" },
      { property: "og:description", content: "Browse every surah and para of the Quran." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuranIndex,
});

function QuranIndex() {
  const { tab = "surah" } = Route.useSearch();
  const navigate = useNavigate({ from: "/quran" });
  const [filter, setFilter] = useState("");
  const surahs = useMemo(() => (filter.trim() ? matchSurahs(filter) : SURAHS), [filter]);

  return (
    <div>
      <PageHeader
        title="Al-Quran"
        subtitle="114 surahs · 30 paras · 6236 ayahs"
        right={
          <Link to="/bookmarks" aria-label="Bookmarks" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
            <Bookmark className="h-5 w-5" />
          </Link>
        }
      />
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 rounded-full bg-muted p-1">
          {(["surah", "juz"] as const).map((t) => (
            <button
              key={t}
              onClick={() => void navigate({ search: t === "juz" ? { tab: "juz" } : {}, replace: true })}
              className={cn(
                "rounded-full py-2 text-sm font-semibold transition-all",
                tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
              )}
            >
              {t === "surah" ? "Surah" : "Para (Juz)"}
            </button>
          ))}
        </div>

        {tab === "surah" && (
          <label className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-card px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter surahs — name or number"
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        )}
      </div>

      <div className="px-1 py-2">
        {tab === "surah" ? (
          surahs.length ? (
            surahs.map((s) => <SurahRow key={s.number} surah={s} />)
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No surah matches “{filter}”.</p>
          )
        ) : (
          Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
            const { start, end } = juzRange(j);
            return (
              <Link
                key={j}
                to="/juz/$id"
                params={{ id: String(j) }}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted"
              >
                <NumberBadge n={j} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">Para {j} · {JUZ_NAMES[j - 1]}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {getSurah(start.surah)!.name} {start.surah}:{start.ayah} → {getSurah(end.surah)!.name} {end.surah}:{end.ayah}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
