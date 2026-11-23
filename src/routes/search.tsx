import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, Layers, Search as SearchIcon, X } from "lucide-react";
import { PageHeader } from "@/components/noor/PageHeader";
import { SurahRow } from "@/components/noor/SurahRow";
import { translationClass } from "@/components/noor/VerseList";
import {
  getSurah,
  hasArabic,
  JUZ_NAMES,
  matchSurahs,
  parseJuz,
  parseReference,
  searchEdition,
  useEdition,
} from "@/lib/quran";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s["q"] === "string" && s["q"] ? { q: s["q"] } : {}),
  head: () => ({
    meta: [
      { title: "Search the Quran — surah, para, ayah or word | Noor" },
      { name: "description", content: "Find any surah, para or ayah, or search words in Arabic, English, Urdu and Hindi." },
      { property: "og:title", content: "Search the Quran | Noor" },
      { property: "og:description", content: "Search any surah, para, ayah reference or word." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const SUGGESTIONS = ["2:255", "Yaseen", "Para 30", "mercy", "patience", "رحمة", "Kahf"];

function SearchPage() {
  const initial = Route.useSearch().q ?? "";
  const [query, setQuery] = useState(initial);
  const q = useDeferredValue(query.trim());
  const { settings } = useSettings();
  const lang = settings.translation === "none" ? "en" : settings.translation;
  const arabicQuery = hasArabic(q);
  const searchLang = arabicQuery ? "ar" : lang === "ur" ? "en" : lang;
  const fallbackLang = arabicQuery ? "ur" : searchLang !== "en" ? "en" : null;

  const ar = useEdition("ar");
  const tr = useEdition(lang);
  const target = useEdition(searchLang);
  const fallback = useEdition(q.length >= 2 ? fallbackLang : null);

  const ref = parseReference(q);
  const juz = parseJuz(q);
  const surahs = useMemo(() => (ref || juz ? [] : matchSurahs(q).slice(0, 6)), [q, ref, juz]);

  const [limit, setLimit] = useState(30);
  const hits = useMemo(() => {
    if (!target.data || q.length < 2 || ref || juz) return [];
    let found = searchEdition(target.data, q, arabicQuery);
    if (found.length === 0 && fallback.data) found = searchEdition(fallback.data, q, false);
    return found;
  }, [target.data, fallback.data, q, ref, juz, arabicQuery]);

  return (
    <div>
      <PageHeader title="Search" subtitle="Surah, para, ayah (2:255) or any word" />
      <div className="sticky top-[61px] z-20 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 shadow-soft focus-within:border-primary">
          <SearchIcon className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(30);
            }}
            placeholder="Search the Quran…"
            className="h-12 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button aria-label="Clear" onClick={() => setQuery("")} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {!q && (
        <div className="px-4 pt-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Try</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => setQuery(s)} className="rounded-full border border-border bg-card px-4 py-2 text-sm">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4">
        {ref && (
          <Link
            to="/surah/$id"
            params={{ id: String(ref.surah) }}
            search={{ ayah: ref.ayah }}
            className="mt-2 block rounded-3xl border border-primary/40 bg-primary-soft p-4"
          >
            <div className="flex items-center justify-between text-sm font-semibold text-primary">
              Go to {getSurah(ref.surah)!.name} {ref.surah}:{ref.ayah} <ArrowRight className="h-4 w-4" />
            </div>
            <p className="font-arabic mt-2 text-right text-2xl leading-[2.1]">{ar.data?.[ref.surah - 1]?.[ref.ayah - 1]}</p>
            <p dir={lang === "ur" ? "rtl" : "ltr"} className={cn("mt-1 text-sm text-muted-foreground", translationClass(lang))}>
              {tr.data?.[ref.surah - 1]?.[ref.ayah - 1]}
            </p>
          </Link>
        )}
        {juz && (
          <Link to="/juz/$id" params={{ id: String(juz) }} className="mt-2 flex items-center gap-3 rounded-3xl border border-primary/40 bg-primary-soft p-4">
            <Layers className="h-5 w-5 text-primary" />
            <span className="flex-1 font-semibold">Para {juz} · {JUZ_NAMES[juz - 1]}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        )}
      </div>

      {surahs.length > 0 && (
        <section className="mt-2">
          <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Surahs</p>
          <div className="px-1">{surahs.map((s) => <SurahRow key={s.number} surah={s} />)}</div>
        </section>
      )}

      {q.length >= 2 && !ref && !juz && (
        <section className="px-4 pb-6">
          <p className="pb-2 pt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {target.isLoading ? "Searching…" : `Ayahs · ${hits.length >= 200 ? "200+" : hits.length} found`}
          </p>
          <div className="space-y-3">
            {hits.slice(0, limit).map((h) => (
              <Link
                key={`${h.surah}:${h.ayah}`}
                to="/surah/$id"
                params={{ id: String(h.surah) }}
                search={{ ayah: h.ayah }}
                className="block rounded-3xl border border-border bg-card p-4 shadow-soft"
              >
                <p className="text-xs font-semibold text-primary">
                  {getSurah(h.surah)!.name} · {h.surah}:{h.ayah}
                </p>
                <p className="font-arabic mt-2 line-clamp-2 text-right text-xl leading-[2]">{ar.data?.[h.surah - 1]?.[h.ayah - 1]}</p>
                <p
                  dir={lang === "ur" ? "rtl" : "ltr"}
                  className={cn("mt-1 line-clamp-3 text-sm text-muted-foreground", translationClass(lang))}
                >
                  <Highlight text={tr.data?.[h.surah - 1]?.[h.ayah - 1] ?? h.text} query={arabicQuery ? "" : q} />
                </p>
              </Link>
            ))}
          </div>
          {hits.length > limit && (
            <button onClick={() => setLimit((l) => l + 30)} className="mt-4 w-full rounded-2xl border border-border py-3 text-sm font-semibold">
              Show more
            </button>
          )}
          {!target.isLoading && hits.length === 0 && surahs.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Nothing found for “{q}”.</p>
          )}
        </section>
      )}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-gold-soft px-0.5 text-foreground">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}
