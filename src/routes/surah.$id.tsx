import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/noor/PageHeader";
import { ReaderTools } from "@/components/noor/ReaderTools";
import { VerseList } from "@/components/noor/VerseList";
import { getSurah, juzOf } from "@/lib/quran";

export const Route = createFileRoute("/surah/$id")({
  validateSearch: (s: Record<string, unknown>): { ayah?: number } => {
    const n = Number(s["ayah"]);
    return Number.isInteger(n) && n > 0 ? { ayah: n } : {};
  },
  loader: ({ params }) => {
    const surah = getSurah(Number(params.id));
    if (!surah) throw notFound();
    return { surah };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.surah;
    const title = s ? `Surah ${s.name} (${s.arabic}) — ${s.meaning} | Noor` : "Surah | Noor";
    const description = s
      ? `Read Surah ${s.name}, ${s.ayahs} ayahs, in Arabic with English, Urdu and Hindi translation.`
      : "Read the Quran with translation.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SurahPage,
});

function SurahPage() {
  const { surah } = Route.useLoaderData();
  const { ayah } = Route.useSearch();
  const refs = useMemo(
    () => Array.from({ length: surah.ayahs }, (_, i) => ({ surah: surah.number, ayah: i + 1 })),
    [surah],
  );
  const focus = useMemo(() => (ayah && ayah <= surah.ayahs ? { surah: surah.number, ayah } : undefined), [ayah, surah]);
  const prev = getSurah(surah.number - 1);
  const next = getSurah(surah.number + 1);

  return (
    <div>
      <PageHeader
        back
        title={surah.name}
        subtitle={`${surah.number}. ${surah.meaning} · Para ${juzOf(surah.number, 1)}`}
        right={<ReaderTools />}
      />
      <VerseList key={surah.number} refs={refs} focusAyah={focus} />
      <nav className="flex gap-3 px-4 pb-6">
        {prev ? (
          <Link to="/surah/$id" params={{ id: String(prev.number) }} className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
            <ChevronLeft className="h-4 w-4" />
            <span className="truncate">{prev.name}</span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link to="/surah/$id" params={{ id: String(next.number) }} className="flex flex-1 items-center justify-end gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
            <span className="truncate">{next.name}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : <span className="flex-1" />}
      </nav>
    </div>
  );
}
